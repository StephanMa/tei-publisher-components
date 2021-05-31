import '@polymer/paper-icon-button';
import { pbMixin } from "./pb-mixin.js";

/**
 * Return the first child of ancestor which contains current.
 * Used to adjust nested anchor points.
 * 
 * @param {Node} current the anchor node
 * @param {Node} ancestor the context ancestor node
 * @returns {Node} first child of ancestor containing current
 */
function extendRange(current, ancestor) {
  let parent = current;
  while (parent.parentNode !== ancestor) {
    parent = parent.parentElement;
  }
  return parent;
}

/**
 * Check if the nodeToCheck should be ignored when computing offsets.
 * Applies e.g. to footnote markers.
 * 
 * @param {Node} nodeToCheck the node to check
 * @returns true if node should be ignored
 */
function isSkippedNode(nodeToCheck) {
  let node = nodeToCheck;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }
  const href = /** @type {Element} */ (node).getAttribute('href');
  return href && /^#fn_.*$/.test(href);
}

/**
 * For a given HTML node, compute the number of characters from the start
 * of the parent element.
 *
 * @param {Node} node the node for which to compute an absolute offset
 * @param {Number} offset start offset
 * @returns {Number} absolute offset
 */
function absoluteOffset(container, node, offset) {
  const walker = document.createTreeWalker(container);
  walker.currentNode = node;
  while (walker.previousNode()) {
    const sibling = walker.currentNode;
    if (!(sibling.nodeType === Node.ELEMENT_NODE || isSkippedNode(sibling))) {
      // eslint-disable-next-line no-param-reassign
      offset += sibling.textContent.length;
    }
  }
  return offset;
}

/**
 * Convert the start or end boundary of a browser range by computing
 * the number of characters from the start of the parent element.
 *
 * @param {Node} node input node
 * @param {Number} offset offset relative to the parent element
 * @returns
 */
function rangeToPoint(node, offset, position = 'start') {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const container = /** @type {Element} */ (node).closest('[data-tei]');
    if (offset === 0) {
      return {
        parent: container.getAttribute('data-tei'),
        offset: 0,
      };
    }
    const child = container.childNodes[offset];
    return {
      parent: container.getAttribute('data-tei'),
      offset: position === 'end' ? absoluteOffset(container, child, 0) - 1 : absoluteOffset(container, child, 0),
    };
  }
  const container = /** @type {Element} */ (node.parentNode).closest('[data-tei]');
  return {
    parent: container.getAttribute('data-tei'),
    offset: absoluteOffset(container, node, offset),
  };
}

function ancestors(node, selector) {
  let count = 0;
  let parent = node.parentNode;
  while (parent && parent !== node.getRootNode()) {
    if (parent.classList.contains(selector)) {
      count += 1;
    }
    parent = parent.parentNode;
  }
  return count;
}

/**
 * Convert a point given as number of characters from the start of the container element
 * to a coordinate relative to a DOM element.
 *
 * @param {Node} container the container element
 * @param {*} offset absolute offset
 * @returns
 */
function pointToRange(container, offset) {
  let relOffset = offset;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (relOffset - walker.currentNode.textContent.length < 0) {
      return [walker.currentNode, relOffset];
    }
    if (!isSkippedNode(walker.currentNode)) {
      relOffset -= walker.currentNode.textContent.length;
    }
  }
  return null;
}

/**
 * Create a marker for an annotation. Position it absolute next to the annotation.
 * 
 * @param {Element} span the span for which to display the marker
 * @param {Element} root element with relative position
 * @param {Number} margin additional margin to avoid overlapping markers
 */
function showMarker(span, root, margin = 0) {
  const rootRect = root.getBoundingClientRect();
  const rects = span.getClientRects();
  const type = Array.from(span.classList.values()).filter(cl => /^annotation-.*$/.test(cl)).join('');
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    const marker = document.createElement('div');
    marker.className = `marker ${type}`;
    marker.style.position = 'absolute';
    marker.style.left = `${rect.left - rootRect.left}px`;
    marker.style.top = `${(rect.top - rootRect.top) + rect.height}px`;
    marker.style.marginTop = `${margin}px`;
    marker.style.width = `${rect.width}px`;
    marker.style.height = `3px`;
    marker.style.backgroundColor = `var(--pb-${type})`;
    marker.part = 'annotation';
    root.appendChild(marker);
  }
}

/**
 * Clear all markers
 * 
 * @param {HTMLElement} root 
 */
function clearMarkers(root) {
  root.querySelectorAll('.marker').forEach(marker => marker.parentNode.removeChild(marker));
}

/**
 * For all annotations currently shown, create a marker element and position
 * it absolute next to the annotation
 * 
 * @param {HTMLElement} root element containing the markers
 */
function showMarkers(root) {
  clearMarkers(root);
  Array.from(root.querySelectorAll('.annotation')).reverse().forEach((span) => {
    showMarker(span, root, ancestors(span, 'annotation') * 5);
  });
}

export const pbSelectable = superclass =>
  class PbSelectable extends pbMixin(superclass) {
    constructor() {
      super();
      this._ranges = [];
    }

    connectedCallback() {
      super.connectedCallback();

      let isMouseDown = false;

      this._inHandler = false;
      this._pendingCallback = null;

      const scheduleCallback = (delay = 10) => {
        this._pendingCallback = setTimeout(() => {
          this._selectionChanged();
        }, delay);
      };

      /** @param {Event} event */
      this._eventHandler = event => {
        if (event.type === 'selectionchange' && this._inHandler) {
          return;
        }
        if (event.type === 'mousedown') {
          isMouseDown = true;
        }
        if (event.type === 'mouseup') {
          isMouseDown = false;
        }

        // If the user makes a selection with the mouse, wait until they release
        // it before reporting a selection change.
        if (isMouseDown) {
          return;
        }

        this._cancelPendingCallback();

        // Schedule a notification after a short delay. The delay serves two
        // purposes:
        //
        // - If this handler was called as a result of a 'mouseup' event then the
        //   selection will not be updated until the next tick of the event loop.
        //   In this case we only need a short delay.
        //
        // - If the user is changing the selection with a non-mouse input (eg.
        //   keyboard or selection handles on mobile) this buffers updates and
        //   makes sure that we only report one when the update has stopped
        //   changing. In this case we want a longer delay.

        const delay = event.type === 'mouseup' ? 10 : 100;
        scheduleCallback(delay);
      };

      document.addEventListener('selectionchange', this._eventHandler.bind(this));
      this.shadowRoot.addEventListener('mousedown', this._eventHandler.bind(this));
      this.shadowRoot.addEventListener('mouseup', this._eventHandler.bind(this));

      this.subscribeTo('pb-refresh', () => {
        this._ranges = [];
        this._currentSelection = null;
        clearMarkers(this.shadowRoot.getElementById('view'));
        this.emitTo('pb-annotations-changed', { ranges: this._ranges });
      });

      this.subscribeTo('pb-add-annotation', this._addAnnotation.bind(this));
    }

    _updateAnnotation(teiRange) {
      const view = this.shadowRoot.getElementById('view');
      const context = view.querySelector(`[data-tei="${teiRange.context}"]`);

      const range = document.createRange();

      const startPoint = pointToRange(context, teiRange.start);
      const endPoint = pointToRange(context, teiRange.end);
      console.log('<pb-selectable> Range before adjust: %o %o', startPoint, endPoint);
      if (startPoint[0] !== endPoint[0] && startPoint[1] === 0) {
        range.setStartBefore(extendRange(startPoint[0], context));
      } else {
        range.setStart(startPoint[0], startPoint[1]);
      }

      if (startPoint[0] !== endPoint[0] && endPoint[0].textContent.length - 1 === endPoint[1]) {
        range.setEndAfter(extendRange(endPoint[0], context));
      } else {
        range.setEnd(endPoint[0], endPoint[1]);
      }

      console.log('<pb-selectable> Range: %o', range);
      const span = document.createElement('span');
      span.className = `annotation annotation-${teiRange.type} ${teiRange.type}`;
      // span.appendChild(range.extractContents());

      range.surroundContents(span);
      // range.insertNode(span);

      showMarkers(this.shadowRoot.getElementById('view'));
    }

    updateAnnotations() {
      this._ranges.forEach(this._updateAnnotation.bind(this));
      showMarkers(this.shadowRoot.getElementById('view'));
    }

    _selectionChanged() {
      const selection = this.shadowRoot.getSelection();
      const range = this._selectedRange(selection);
      if (range) {
        let changed = false;
        const ancestor = range.commonAncestorContainer;
        if (ancestor.nodeType === Node.ELEMENT_NODE) {
          if (range.startContainer.parentElement !== ancestor) {
            const parent = extendRange(range.startContainer, ancestor);
            range.setStartBefore(parent);
            changed = true;
          }
          if (range.endContainer.parentElement !== ancestor) {
            const parent = extendRange(range.endContainer, ancestor);
            range.setEndAfter(parent);
            changed = true;
          }
        }
        this._currentSelection = range;
        console.log('<pb-selectable> selection: %o', range);

        if (changed) {
          this._inHandler = true;
          setTimeout(() => {
            selection.removeAllRanges();
            selection.addRange(range);
            this.inHandler = false;
          }, 100);
        }

        this.emitTo('pb-selection-changed', { hasContent: true });
      } else {
        this.emitTo('pb-selection-changed', { hasContent: false });
      }
    }

    _addAnnotation(ev) {
      const range = this._currentSelection;
      const startRange = rangeToPoint(range.startContainer, range.startOffset);
      const endRange = rangeToPoint(range.endContainer, range.endOffset, 'end');
      const adjustedRange = {
        context: startRange.parent,
        start: startRange.offset,
        end: endRange.offset,
        text: range.cloneContents().textContent,
      };
      if (ev.detail.type) {
        adjustedRange.type = ev.detail.type;
      }
      console.log('<pb-selectable> range adjusted: %o', adjustedRange);
      this._ranges.push(adjustedRange);
      this.emitTo('pb-annotations-changed', { ranges: this._ranges });
      this._updateAnnotation(adjustedRange);
    }

    /**
     *
     * @returns {Range|null} the selected range, if any
     */
    _selectedRange(selection) {
      if (!selection || selection.rangeCount === 0) {
        return null;
      }
      if (selection.anchorNode.getRootNode() !== this.shadowRoot) {
        return null;
      }
      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        return null;
      }
      return range;
    }

    _cancelPendingCallback() {
      if (this._pendingCallback) {
        clearTimeout(this._pendingCallback);
        this._pendingCallback = null;
      }
    }
  };
