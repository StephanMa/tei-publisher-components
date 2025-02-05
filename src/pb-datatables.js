import { PolymerElement, html } from '../@polymer/polymer';

import '../@polymer/paper-checkbox/paper-checkbox.js';
import '../@polymer/paper-tooltip/paper-tooltip.js';
import '../@polymer/paper-progress/paper-progress.js';
import '../@polymer/iron-media-query/iron-media-query.js';
import '../@polymer/iron-icon/iron-icon.js';
import { mixinBehaviors } from '../@polymer/polymer/lib/legacy/class.js';
import { IronScrollTargetBehavior } from '../@polymer/iron-scroll-target-behavior/iron-scroll-target-behavior.js';
import { IronResizableBehavior } from '../@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import { dom } from '../@polymer/polymer/lib/legacy/polymer.dom.js';
import './bwt-datatable-column.js';
import './bwt-datatable-edit-dialog.js';
import './datatable-icons.js';
import { CollectionHelpers } from './src/collectionHelpers.js';
'use scrict';

class PaperDatatable extends  pbMixin(mixinBehaviors([IronScrollTargetBehavior, IronResizableBehavior], PolymerElement)) {
	static get template() {
		return html`
			<style>
			:host {
				display: block;
				@apply --paper-font-common-base;
				position: relative;
			}
			:host([resize-behavior='overflow']) #container{
				overflow: auto;
			}
			:host([resize-behavior='dynamic-columns']) #container{
				overflow: auto;
			}
			:host([resize-behavior='fixed']) table{
				table-layout: fixed;
			}
			:host([resize-behavior='fixed']) th{
				overflow: hidden;
				text-overflow: ellipsis;
			}
			:host([resize-behavior='fixed']) td{
				overflow: hidden;
			}
			table{
				border-spacing: 0px;
				width:100%;
			}
			tr td, tr th{
				border-bottom: 1px solid var(--paper-datatable-divider-color, var(--divider-color));
				padding: 6px 28px 6px 28px;
				box-sizing: border-box;
				@apply --paper-datatable-cell-styles;
			}
			td{
				height: 48px;
			}
			th{
				font-weight: 500;
				text-align:left;
				white-space: nowrap;
				@apply --paper-font-common-base;
				-webkit-user-select: none;
				-ms-user-select: none;
				-moz-user-select: none;
				user-select: none;
				color: rgba(0,0,0, .54);
				font-size:12px;
				transition: linear .1s color, padding-left .2s linear;
				box-sizing: border-box;
				height: 56px;
			}
			th:not([data-sortable]) iron-icon.sort{
				display: none;
			}
			th[data-sortable] iron-icon.sort {
				transition: transform .2s linear, width .2s linear, color .2s linear;
				color: rgba(0,0,0, .26);
				width: 0px;
				@apply --paper-datatable-column-header-sort-icon-hover;
			}
			th[data-sortable]{
				cursor: pointer;
			}
			th[data-sortable]:not([data-sorted]):hover iron-icon{

			}
			th[data-sortable][data-sorted], th[data-sortable]:hover{
				padding-left: 4px;
				color: rgba(0,0,0, .87);
				@apply --paper-datatable-column-header-sorted;
			}
			th[data-sortable][data-sorted] iron-icon, th[data-sortable]:hover iron-icon{
				width: 24px;
			}
			th[data-sortable][data-sorted] iron-icon.sort{
				color: rgba(0,0,0, .87);
				@apply --paper-datatable-column-header-sorted;
			}
			th[data-sortable]:not([data-sorted]) iron-icon{
				transform: rotate(180deg);
			}
			th[data-sortable]:not([data-sorted]):not([data-sort-direction='desc']) iron-icon{
				transform: rotate(0deg);
			}
			th[data-sortable][data-sorted]:not([data-sort-direction='desc']) iron-icon{
				transform: rotate(180deg);
			}
			tr td{
				cursor: pointer;
			}
			tr td.bound-cell[data-edit-icon]{
				padding-right: 10px;
			}
			th.column{
				@apply --paper-datatable-column-header;
			}
			tr th span{
				vertical-align: middle;
			}
			td.bound-cell{
				font-size: 13px;
				color: rgba(0,0,0,.87);
				@apply --paper-datatable-cell;
			}
			td.bound-cell div span{
				flex: 1;
			}
			td.bound-cell iron-icon.editable{
				display: none;
			}
			td.bound-cell div{
				display: flex;
				align-items:center;
			}
			td.bound-cell[data-edit-icon] iron-icon.editable{
				color: var(--paper-datatable-icon-color, rgba(0,0,0,.54));
				width: 18px;
				display: inline-block;
				padding-left: 7px;
			}
			td.bound-cell paper-input, td.bound-cell paper-textarea, paper-datatable-edit-dialog paper-input, paper-datatable-edit-dialog paper-textarea{
				--paper-input-container-input: {
					font-size: 13px;
					line-height: 1.4em;

				};
			}
			tr td:first-child, tr th:first-child{
				/*change it from 24 to 28 px cause have some error on mobile*/
				padding-left: 28px;
				padding-right: 0px;
				width:56px;
				min-width:56px;
			}
			tr td:nth-of-type(2), tr th:nth-of-type(2){
				/*changed it from 10px to 28px because second row have wrong left padding on mobile*/
				padding-left: 28px;
			}
			td:last-of-type, th:last-of-type{
				padding-right: 24px;
			}
			td:last-of-type{
				@apply --paper-datatable-cell-last;
			}
			th:last-of-type{
				@apply --paper-datatable-column-header-last;
			}
			tr[data-selected] td{
				background: var(--paper-datatable-row-selection-color, var(--paper-grey-100));
			}
			tr:hover td{
				background: var(--paper-datatable-row-hover-color, var(--paper-grey-200));
			}
			tbody tr:last-of-type td{
				border-bottom:none;
			}
			tbody td .array-item {
				display: inline-block;
				@apply --paper-datatable-array-item;
			}
			tbody td .class-1 {
				@apply --paper-datatable-class-1;
			}
			tbody td .class-2 {
				@apply --paper-datatable-class-2;
			}
			tbody td .class-3 {
				@apply --paper-datatable-class-3;
			}
			tbody td .class-4 {
				@apply --paper-datatable-class-4;
			}
			tbody td .class-5 {
				@apply --paper-datatable-class-5;
			}

			/* progress: */
			table tr.progress {

			}
			table tr.progress th paper-progress{
				height: 0px;
				transition: linear .2s height;
			}
			table tr.progress[data-progress] th paper-progress{
				height: 3px;
			}
			table tr.progress th{
				padding: 0px;
				height: 1px;
				border-bottom:0px;
			}
			table tr.progress th paper-progress{
				width: 100%;
			}
			paper-checkbox{
				--paper-checkbox-unchecked-color: var(--paper-datatable-checkbox-border-color, var(--primary-text-color));
				--paper-checkbox-checked-color: var(--paper-datatable-checkbox-color, var(--accent-color));
				@apply --paper-datatable-checkbox;
			}
			th paper-checkbox{
				--paper-checkbox-unchecked-color: var(--paper-datatable-header-checkbox-border-color, var(--primary-text-color));
				--paper-checkbox-checked-color: var(--paper-datatable-header-checkbox-color, var(--accent-color));
				@apply --paper-datatable-header-checkbox;
			}
			.partialSelectionContainer{
				width:18px;
				height:18px;
				position:relative;
				display:flex;
				align-items:center;
				justify-content:center;
			}
			.partialSelection{
				width:6px;
				height:2px;
				background: var(--paper-datatable-header-checkbox-border-color, rgba(0,0,0,.54));
				border-radius:1px;
				transition: transform .1s linear;
				transform: scale(0) rotate(-45deg);
			}
			.partialSelection[data-checked]{
				transform: scale(1) rotate(0deg);
			}

			/*CSS for mobile view*/

			/* Force table to not be like tables anymore */
			table[mobile-view], thead[mobile-view], tbody[mobile-view], th[mobile-view], td[mobile-view], tr[mobile-view] {
				display: block;

			}

			tbody[mobile-view]{
				overflow: hidden;
			}

			/* Hide table headers (but not display: none;, for accessibility) */
			thead tr[mobile-view] {
				position: absolute;
				top: -9999px;
				left: -9999px;
			}

			tr[mobile-view] {
				border: 1px solid #ccc;
			}

			td[mobile-view] {
				border: none;
				border-bottom:none !important;
				position: relative;
				padding-right: 26px !important;
				text-align: right !important;
				height: 36px;
			}

			td[mobile-view]:last-of-type {
				text-align: -webkit-right !Important;
				padding-bottom: 45px !important;
			}

			tr td[mobile-view]:first-child {
				margin-left: 12px;
				padding-right: 0px;
				padding-top: 15px;
				width: 100%;
				left: -12px;
				text-align: left !important;
			}

			tr[mobile-view]:hover td {
				background: none;
			}

			tr[mobile-view] td[mobile-view] div p.mobileHeader{
				font-weight: bold;
			}

			.fixedToTop {
				background: #fff;
				position: fixed !important;
				box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
				top: 0;
				z-index: 1;
			}

			.fixedToTop tr td, .fixedToTop tr th {
				border-bottom: 0px;
			}
		</style>
		<iron-media-query query="(max-width: [[responseWidth]])" query-matches="{{mobileView}}"></iron-media-query>
		<paper-datatable-edit-dialog id="dialog"></paper-datatable-edit-dialog>
		<div id="container">
		<table mobile-view$="[[mobileView]]">
			<thead >
				<tr mobile-view$="[[mobileView]]">
					<template is="dom-if" if="[[selectable]]">
						<th mobile-view$="[[mobileView]]">
							<template is="dom-if" if="[[multiSelection]]">
								<div class="partialSelectionContainer">
									<div class="partialSelection" data-checked$="[[_partialSelection]]"></div>
									<paper-checkbox on-change="toggleAll" checked$="[[_allChecked(selectedKeys.splices, data.*)]]" style="position:absolute;left:0px;top:0px;"></paper-checkbox>
								</div>
							</template>
						</th>
					</template>
					<template id="columnRepeat" is="dom-repeat" items="[[_columns]]" as="column" on-dom-change="_columnsRendered">
						<th class="column" data-sortable$="[[column.sortable]]" data-column="[[column]]" mobile-view$="[[mobileView]]" on-tap="_handleSort" style$="[[column._styleString]]">
							<iron-icon icon="datatable:sort-desc-md" class="sort"></iron-icon>
							<span id="title">[[column.header]]</span>
							<template is="dom-if" if="[[column.tooltip]]">
								<paper-tooltip offset="-10" fit-to-visible-bounds>[[column.tooltip]]</paper-tooltip>
							</template>
						</th>
					</template>
				</tr>
				<tr class="progress" data-progress$="[[progress]]" mobile-view$="[[mobileView]]">
					<th colspan$="[[_numberOfColumnsPlusOne(_columns.splices)]]">
						<!--<paper-progress indeterminate></paper-progress>-->
					</th>
				</tr>
				<tr hidden$="[[!_noItemsVisible(_rowKeys.splices)]]" mobile-view$="[[mobileView]]">
					<th colspan$="[[_numberOfColumnsPlusOne(_columns.splices)]]" style="text-align:center;">
						<slot name="no-results"></slot>
					</th>
				</tr>
			</thead>
			<tbody mobile-view$="[[mobileView]]">
				<template id="rowRepeat" is="dom-repeat" items="[[_rowKeys]]" as="rowKey" on-dom-change="_restructureData">
					<!--
						duplication due to https://github.com/David-Mulder/paper-datatable/issues/3 ...
					-->
					<template is="dom-if" if="[[multiSelection]]">
						<tr data-key$="[[rowKey]]" mobile-view$="[[mobileView]]" data-selected$="[[_isRowSelected(rowKey, selectedKeys.splices)]]" style$="[[_customRowStyle(rowKey)]]">
							<template is="dom-if" if="[[selectable]]">
								<td on-tap="_cellTapped" mobile-view$="[[mobileView]]">
									<!-- a somewhat specific 'hack' for <paper-datatable-card> :/ -->
									<!-- <template is="dom-if" if="{{!_isEqual(rowKey, '__new__')}}"> -->
										<paper-checkbox checked$="[[_isRowSelected(rowKey, selectedKeys.splices)]]" on-change="_setSelection"></paper-checkbox>
									<!-- </template> -->
								</td>
							</template>
							<template id="cellRepeat" is="dom-repeat" items="[[_columns]]" as="column" on-dom-change="_restructureData">
								<td data-empty class="bound-cell" mobile-view$="[[mobileView]]" data-column="[[column]]" data-editable$="[[column.editable]]" data-edit-icon$="[[column.editIcon]]" on-tap="_cellTapped">
									<div>
										<p class="mobileHeader" hidden$="[[!mobileView]]"></p>
										<span></span>
										<iron-icon icon="datatable:editable" class="editable"></iron-icon>
									</div>
								</td>
							</template>
						</tr>
					</template>
					<template is="dom-if" if="[[!multiSelection]]">
						<tr data-key$="[[rowKey]]" mobile-view$="[[mobileView]]" data-selected$="[[_isRowSelected(rowKey, selectedKey)]]" style$="[[_customRowStyle(rowKey)]]">
							<template is="dom-if" if="[[selectable]]">
								<td on-tap="_cellTapped" mobile-view$="[[mobileView]]">
									<paper-checkbox checked="[[_isRowSelected(rowKey, selectedKey)]]" on-change="_setSelection"></paper-checkbox>
								</td>
							</template>
							<template id="cellRepeat" is="dom-repeat" items="[[_columns]]" as="column" on-dom-change="_restructureData">
								<td data-empty class="bound-cell" mobile-view$="[[mobileView]]" data-column="[[column]]" data-editable$="[[column.editable]]" data-edit-icon$="[[column.editIcon]]" on-tap="_cellTapped">
									<div>
										<p style="font-weight: bold;" hidden$="[[!mobileView]]"></p>
										<span></span>
										<iron-icon icon="datatable:editable" class="editable"></iron-icon>
									</div>
								</td>
							</template>
						</tr>
					</template>
				</template>
			</tbody>
		</table>
		</div>
	   `;
	}
	static get is() {
		return 'paper-datatable';
	}
	// Element properties
	static get properties() {
		return {
			/**
					 * Read only array of all the `paper-datatable-column`'s
					 *
					 * @attribute _columns
					 * @type Array
					 */
			_columns: {
				type: Array
			},
			/**
			 * Array of objects containing the data to be shown in the table.
			 *
			 * @attribute data
			 * @type Array
			 * @required
			 */
			data: {
				type: Array,
				notify: true
			},
			/**
			 * Whether to show checkboxes on the left to allow row selection.
			 *
			 * @attribute selectable
			 * @type Boolean
			 * @default false
			 */
			selectable: {
				type: Boolean
			},
			/**
			 * Whether to allow selection of more than one row.
			 *
			 * @attribute multiSelection
			 * @type Boolean
			 * @default false
			 */
			multiSelection: {
				type: Boolean,
				value: false
			},
			/**
			 * If `multi-selection` then this contains an array of selected row keys.
			 *
			 * @attribute selectedIds
			 * @type Array
			 * @default []
			 */
			selectedKeys: {
				type: Array,
				notify: true,
				value: []
			},
			/**
			 * If `multi-selection` is off then this contains the key of the selected row.
			 *
			 * @attribute selectedId
			 * @type Object
			 */
			selectedKey: {
				type: Object,
				notify: true
			},
			/**
			 * If `multi-selection` is off then this contains the selected row.
			 *
			 * @attribute selectedId
			 * @type Object
			 */
			selectedItem: {
				type: Object,
				notify: true,
				computed: '_getByKey(selectedKey)'
			},
			/**
			 * If `multi-selection` is on then this contains an array of the selected rows.
			 *
			 * @attribute selectedId
			 * @type Object
			 */
			selectedItems: {
				type: Array,
				notify: true,
				computed: '_getSelectedItems(selectedKeys.splices)'
			},
			_internalSortEnabled: {
				type: Boolean,
				value: false
			},
			_rowKeys: {
				type: Array
			},
			_currentlySortedColumn: {
				type: Object
			},
			_cellInstances: {
				type: Object
			},
			/**
			 * Whether to show the progress bar. As the progress bar is often not used in standalone
			 * `<paper-datatable>'s the `<paper-progress>` element isn't included by default and needs to be
			 * manually imported.
			 *
			 * @attribute progress
			 * @type Boolean
			 * @default false
			 */
			progress: {
				type: Boolean,
				value: false
			},
			/**
			 * Overflow, fixed or 'dynamic-columns'
			 *
			 * @attribute resizeBehavior
			 * @type String
			 * @default 'overflow'
			 */
			resizeBehavior: {
				type: String,
				value: 'overflow',
				reflectToAttribute: true
			},
			_partialSelection: {
				type: Boolean
			},
			/**
			 * The filter attribute can be used to specify a filter which will be applied to the `data`.
			 * Note that selections should fully ignore filtering, and a filter only affects which data is
			 * visible.
			 *
			 * The function takes three arguments: `item`, `key` and `items` per the JS filter function.
			 *
			 * For a demo please see [here](demo/filter.html).
			 *
			 * IMPORTANT: This is a property, not a method you should call directly.
			 *
			 * @attribute filter
			 * @type Function
			 */
			filter: {
				type: Function
			},
			/**
			 * Response width to show datatable on mobile devices
			 *
			 * @attribute responseWidth
			 * @type String
			 * @default '767px'
			 */
			responseWidth: {
				type: String,
				value: '767px'
			},
			mobileView: Boolean,
			/**
			 * Fix column header to the top of the page on scroll
			 *
			 * @attribute headerFixed
			 * @type Boolean
			 * @default false
			 */
			headerFixed: {
				type: Boolean,
				reflectToAttribute: true,
				value: false
			},
			_theadDistanseToTop: {
				type: Number
			},
            /**
             * If set, trigger a `pb-show-annotation` event as soon as the element is initialized.
             * Use this to make `pb-facsimile` or `pb-svg` switch to the given image/coordinates upon
             * load.
             */
            emitOnLoad: {
                type: Boolean,
                attribute: 'emit-on-load'
            },
            event: {
                type: String
            }
		}
	}

	// Element observers
	static get observers() {
		return [
			// '_restructureData(data.*, _columns.splices)',
			'_setRowKeys(data.splices)',
			'_notifyPathOnInstances(data.*)',
			'_linkSelectedItem(selectedKey)',
			'_linkSelectedItems(selectedKeys.splices)',
			'_setPartialSelection(selectedKeys.splices, data.*)'
		]
	}
    
      connectedCallback() {
        super.connectedCallback();
        this.subscribeTo(this.event, (ev) => {
            if (this.history && ev.detail && ev.detail.params) {
                const start = ev.detail.params.start;
                if (start) {
                    this.setParameter('start', start);
                    this.pushHistory('pagination', {
                        start: start
                    });
                }
            }
            PbLoad.waitOnce('pb-page-ready', () => {
                this.load(ev);
            });
        });

        if (this.history) {
            window.addEventListener('popstate', (ev) => {
                ev.preventDefault();
                if (ev.state && ev.state.start && ev.state.start !== this.start) {
                    this.start = ev.state.start;
                    this.load();
                }
            });
        }

        this.subscribeTo('pb-toggle', ev => {
            this.toggleFeature(ev);
        });

        this.subscribeTo('pb-i18n-update', ev => {
            const needsRefresh = this.language && this.language !== ev.detail.language;
            this.language = ev.detail.language;
            if (this.useLanguage && needsRefresh) {
                this.load();
            }
        }, []);

        this.signalReady();
    }
    
	// ADDDD
	// listeners: {
	// 	'container.scroll': '_triggerDialogResize',
	// 	'iron-resize': '_resizeListener'
	// },

	ready() {
		super.ready();
		this.set('_columns', []);
		this.set('selectedKeys', []);
		this._observer = dom(this).observeNodes((info) => {
			this._queryAndSetColumns();
		});
	}

	_queryAndSetColumns() {
		var columns = this.queryAllEffectiveChildren('paper-datatable-column');
		var self = this;
		columns.forEach(function (column, index) {
			if (!column.beenAttached.state.ready) {
				column.parentNodeRef = self;
				self.async(function () {
					column.beenAttached.ready();
				});
				column.index = index;
				self.listen(column, 'header-changed', '_updateHeaderColumn');
			}
		});
		var inactiveColumns = columns.filter(function (column) { return !column.inactive });
		this.set('_columns', inactiveColumns);
		this.async(function () {
			this._applySortedIndicatorsToDOM();
		});
	}

	_setRowKeys() {
		var rowKeys = [];
		this._dataKeyCollection = new CollectionHelpers(this.data || []);
		(this.data || []).forEach(function (row) {
			var key = this._getKeyByItem(row);
			if ('filter' in this) {
				if (this.filter(row, key, this.data)) {
					rowKeys.push(key);
				}
			} else {
				rowKeys.push(key);
			}
		}.bind(this));
		this.set("_rowKeys", rowKeys);
		//why again was this necessary?
		this._internalSort(this._currentlySortedColumn);
	}

	/**
	 * If you have been changing data on the `data` property outside of the official Polymer functions
	 * calling this function *may* get you the updates you want.
	 */
	reload() {
		this._setRowKeys();
	}

	/**
	 * Hardcore reset of the entire element. Sets `data` to `[]` and resets all cells.
	 */
	reset() {
		this.set('data', []);
		this._reset();
	}

	_reset() {
		var cells = this.shadowRoot.querySelectorAll('.bound-cell');
		Array.prototype.forEach.call(cells, this._resetCell.bind(this));
		this.$.rowRepeat.render();
		var cellRepeatList = this.shadowRoot.querySelector('#cellRepeat');
		Array.prototype.forEach.call(cellRepeatList, function (cr) { return cr.render(); });
	}

	_resetCell(cell) {
		cell.setAttribute('data-empty', true);
		cell.removeAttribute('data-row-key');
		delete cell.dataColumn;
		delete cell.instance;
	}

	_restructureData() {
		this.debounce('restructure data', function () {
			var rows = this.shadowRoot.querySelectorAll('tbody tr');
			// loop through the rows
			for (var rowI = 0; rowI < rows.length; rowI++) {
				var row = rows[rowI];
				//find the data that belongs with the row
				var rowData = this.get(['data', rowI]);
				console.log('row data old', rowData);
				console.log('row data new', this._getByKey(row.dataset.key));
				//prevent errors if row empty
				if (!rowData) return;
				// var cells = Polymer.dom(row).querySelectorAll('.bound-cell');
				var cells = dom(row).querySelectorAll('.bound-cell');
				var self = this;
				cells.forEach(function (cell, index) {
					if (!cell.dataColumn) {
						console.log(cell);
					}

					var isEmpty = cell.hasAttribute('data-empty');
					var isWrongRow = cell.getAttribute('data-row-key') !== row.dataset.key;
					var isWrongColumn = cell.dataColumn !== cell.dataBoundColumn;
					if (cell) {
						cell.removeAttribute('data-empty');
						var prop = cell.dataColumn.property;
						var data = rowData[prop];
						cell.setAttribute('data-row-key', row.dataset.key);
						cell.dataBoundColumn = cell.dataColumn;

						if (cell.dataColumn.cellStyle.length > 0) {
							cell.setAttribute('style', cell.dataColumn.cellStyle);
						} else {
							cell.setAttribute('style', '');
						}
						if (cell.style['text-align'] == '' && cell.dataColumn.align) {
							cell.style['text-align'] = cell.dataColumn.align;
						}
						//if(cell.style['min-width'] == '' && cell.dataColumn.width){
						//	cell.style['min-width'] = cell.dataColumn.width;
						//}

						if (cell.dataColumn.template && !cell.dataColumn.dialog) {
							var instance = cell.dataColumn._createCellInstance(
								rowData,
								row.dataset.key
							);
							cell.instance = instance;
							cell.instanceType = 'inline';
							cell.querySelector('p').textContent = self._columns[index].header;
							var spanTag = cell.querySelector('span');
							spanTag.textContent = '';
							spanTag.appendChild(instance.root);
						} else {
							if (cell.instance)
								delete cell.instance;
							//added text to span
							cell.querySelector('p').textContent = self._columns[index].header;
							cell.querySelector('span').textContent = cell.dataColumn._formatValue(data);
							//cell.textContent = data;
						}
					}
				});

			}
		});

	}

	_notifyPathOnInstances(change) {
		if (change.path === 'data') {
			//not too happy about this 'hack', but it will have to do for the moment
			var cells = dom(this.shadowRoot).querySelectorAll('.bound-cell');
			Array.prototype.forEach.call(cells, function (cell) {
				cell.setAttribute('data-row-key', '');
			});
			this._restructureData();
		}
		var path = change.path.split('.');
		if (path.length >= 3) {
			var object = path.shift();
			var rowKey = path.shift();

			var row = this.shadowRoot.querySelector('tbody tr[data-key=\'' + rowKey + '\']');

			if (!row) {
				console.error('critical failure');
				console.log('key', rowKey);
				return false;
			}

			var cells = row.querySelectorAll('td.bound-cell');
			for (var i = 0; i < cells.length; i++) {
				var cell = cells[i];
				var prop = cell.dataColumn.property;

				if (prop == path[0]) {
					if (cell.instance) {
						var localPath = path.slice();
						localPath.shift();
						var instanceValuePath = ['value'].concat(localPath);
						//console.info(cell, "prop column value path", instanceValuePath, "to", change.value);
						cell.instance.notifyPath(instanceValuePath, change.value);
					}
					if (!cell.instance || cell.instanceType == 'dialog') {
						cell.querySelector('span').textContent = this._columns[i]._formatValue(this.get([object, rowKey, prop]));
					}
				}
				if (cell.instance) {
					var instancePath = ['item'].concat(path);
					cell.instance.notifyPath(instancePath, change.value, true);
				}

			}
		}
	}

	/**
	 * Triggered by clicking the top left checkmark. If all are checked it will deselect all checked items.
	 * If some or none are checked it will select all items
	 */
	toggleAll() {
		var triggeredEvent = this._fireCustomEvent(this, "toggle-all", {});
		if (triggeredEvent.defaultPrevented) {
			var allChecked = this._allChecked();
			this.data.forEach(function (item) {
				if (allChecked) {
					this.deselect(item);
				} else {
					this.select(item);
				}
			}.bind(this));
		}
	}

	/**
	 * Select the specified item. Ignore the `notify` parameter.
	 *
	 * @param item
	 * @param Boolean [notify=false] whether to trigger a `selection-changed` event.
	 */
	select(item, notify) {
		notify = typeof notify === 'undefined' ? true : notify;

		var key = this._getKeyByItem(item);
		if (this.multiSelection) {
			if (this.selectedKeys.indexOf(key) == -1) {
				this.push('selectedKeys', key);
			}
		} else {
			this.set('selectedKey', key);
		}
		if (notify) this._fireCustomEvent(this, "selection-changed", { selected: [key] });
	}

	/**
	 * Deselect the specified item. Ignore the `notify` parameter.
	 *
	 * @param item
	 * @param Boolean [notify=false] whether to trigger a `selection-changed` event.
	 */
	deselect(item, notify) {
		notify = typeof notify === 'undefined' ? true : notify;

		var key = this._getKeyByItem(item);
		if (this.multiSelection) {
			var i = this.selectedKeys.indexOf(key);
			this.splice('selectedKeys', i, 1);
		} else {
			this.set('selectedKey', null);
		}
		if (notify) this._fireCustomEvent(this, "selection-changed", { deselected: [key] });
	}
	/**
	 * Deselect all currently selected items. Ignore the `notify` parameter.
	 */
	deselectAll(notify) {
		if (this.multiSelection) {
			this.selectedItems.forEach(function (item) {
				this.deselect(item, notify);
			}.bind(this));
		} else {
			this.deselect(this.selectedItem, notify);
		}
	}

	_allChecked() {
		var allChecked = true;
		this.data.forEach(function (item) {
			var key = this._getKeyByItem(item);
			if (this.selectedKeys.indexOf(key) == -1) {
				allChecked = false;
			}
		}.bind(this));
		return allChecked && this.data.length > 0;
	}

	_someChecked() {
		return this.selectedKeys.length > 0 && !this._allChecked();
	}

	_isRowSelected(key) {
		if (this.multiSelection) {
			return this.selectedKeys.indexOf(key) > -1;
		} else {
			return this.selectedKey == key;
		}
	}

	_setSelection(ev) {
		var key = ev.model.rowKey;
		if (ev.target.checked) {
			if (this.multiSelection) {
				this.push('selectedKeys', key);
				this._fireCustomEvent(this, "selection-changed", { selected: [key] });
			} else {
				if (this.selectedKey) {
					this._fireCustomEvent(this, "selection-changed", { selected: [key], deselected: [this.selectedKey] });
				} else {
					this._fireCustomEvent(this, "selection-changed", { selected: [key] });
				}
				this.selectedKey = key;
			}
		} else {
			if (this.multiSelection) {
				this.splice('selectedKeys', this.selectedKeys.indexOf(key), 1);
			} else {
				this.selectedKey = null;
			}
			this._fireCustomEvent(this, "selection-changed", { deselected: [key] });
		}
	}

	_toggleSelection(key) {
		if (this.selectable) {
			if (this.multiSelection) {
				var checked = this.selectedKeys.indexOf(key) > -1;
				if (checked) {
					this.splice('selectedKeys', this.selectedKeys.indexOf(key), 1);
					this._fireCustomEvent(this, "selection-changed", { deselected: [key] });
				} else {
					this.push('selectedKeys', key);
					this._fireCustomEvent(this, "selection-changed", { selected: [key] });
				}
			} else {
				var checked = this.selectedKey == key;
				if (checked) {
					this.selectedKey = null;
					this._fireCustomEvent(this, "selection-changed", { deselected: [key] });
				} else {
					if (this.selectedKey) {
						this._fireCustomEvent(this, "selection-changed", { selected: [key], deselected: [this.selectedKey] });
					} else {
						this._fireCustomEvent(this, "selection-changed", { selected: [key] });
					}
					this.selectedKey = key;
				}
			}
		}
	}
	/**
	 * Wrapper for platform custom event emitter
	 */
	_fireCustomEvent(context, eventName, eventBody, eventSettings) {
		if (!eventBody) {
			eventBody = {};
		}
		if (!eventSettings) {
			eventSettings = {
				bubbles: false,
				composed: false
			}
		}
		var newEvent = new CustomEvent(eventName, { detail: eventBody, bubbles: eventSettings.bubbles, composed: eventSettings.composed });
		context.dispatchEvent(newEvent);
		return newEvent;
	}
	/**
	 * Sort the specified column, where `column` is a reference to the actual `<paper-datatable-column>`
	 * element.
	 */
	sort(column) {
		this.async(function () {
			var eventBody = {
				sort: {
					property: column.property,
					direction: column.sortDirection
				}, column: column
			}
			var triggeredEvent = this._fireCustomEvent(this, "sort", eventBody);

			this.set('_currentlySortedColumn', column);

			this._applySortedIndicatorsToDOM();
			if (triggeredEvent.defaultPrevented) {
				this._internalSortEnabled = false;
			} else {
				this._internalSortEnabled = true;
			}
			this._internalSort(column);
		});
	}

	_applySortedIndicatorsToDOM() {
		var previouslySortedTh = dom(this.shadowRoot).querySelector("th[data-sorted]");
		if (previouslySortedTh) {
			previouslySortedTh.removeAttribute('data-sorted');
		}

		var column = this._currentlySortedColumn;

		if (column) {
			var thsList = dom(this.shadowRoot).querySelectorAll("th");
			var th = Array.prototype.find.call(thsList, function (el) {
				return el.dataColumn === column;
			});
			//column might have been removed or made inactive
			if (th) {
				th.setAttribute('data-sorted', true);
				th.setAttribute('data-sort-direction', column.sortDirection);
			}
		}
	}

	_internalSort(column) {
		if (this._internalSortEnabled && this._rowKeys) {
			this._rowKeys.sort(function (a, b) {
				if (column.sortDirection == 'desc') {
					var c = a;
					a = b;
					b = c;
				}
				var valA = this._getByKey(a)[column.property];
				var valB = this._getByKey(b)[column.property];
				return column._sort(valA, valB);
			}.bind(this));
			this.set("_rowKeys", this._rowKeys);
		}
	}

	_handleSort(ev) {
		var column = ev.model.column;
		if (column.sortable) {
			column.set('sortDirection', column.sortDirection == 'asc' ? 'desc' : 'asc');
			column.set('sorted', true);
		}
	}

	_cellTapped(ev) {

		var path = ev.composedPath();
		var cell;
		for (var i = 0; i < path.length; i++) {
			if (path[i].nodeName.toLowerCase() == 'td') {
				cell = path[i];
			}
			if (path[i].nodeName.toLowerCase() == 'tr') {
				break;
			}
		}
		var rowModel = this.$.rowRepeat.modelForElement(path[i]);

		// clicks in the checkbox cell do not have a set column
		if (ev.model.column) {
			var item = this._getByKey(rowModel.rowKey);
			var eventBody = { column: ev.model.column, key: rowModel.rowKey, item: item, target: ev.target, originalEvent: ev }
			this._fireCustomEvent(ev.model.column, "cell-tap", eventBody, { bubbles: true, composed: true });
			if (ev.model.column.dialog) {
				this._initializeInDialog(cell, ev.model.column, item, rowModel.rowKey);
				var dialogInitialized = true;
			}
		}

		var triggeredEvent = this._fireCustomEvent(this, "row-tap", { key: rowModel.rowKey, item: this._getByKey(rowModel.rowKey), originalEvent: ev }, { bubbles: true, composed: true });
		if (!triggeredEvent.defaultPrevented && !dialogInitialized) {
			if (path[0].nodeName.toLowerCase() == 'td' || (ev.model.column && !ev.model.column.editable)) {
				this._toggleSelection(rowModel.rowKey);
				ev.preventDefault();
			}
		} else {
			ev.preventDefault();
		}

	}

	_initializeInDialog(cell, column, row, rowKey) {
		var oldCell = this.$.dialog.positionedRelativeTo;
		if (oldCell) {
			delete oldCell.instance;
		}
		this.$.dialog.positionedRelativeTo = cell;
		var instance = column._createCellInstance(
			row,
			rowKey
		);
		cell.instance = instance;
		cell.instanceType = 'dialog';
		// Polymer.dom(this.$.dialog).innerHTML = '';
		this.$.dialog.innerHTML = '';
		// Polymer.dom(this.$.dialog).appendChild(instance.root);
		this.$.dialog.appendChild(instance.root);
		this.$.dialog.findFocus();
	}

	_getKeyByItem(item) {
		return this._dataKeyCollection.getKey(item);
	}

	_getByKey(key) {
		if (key === null) {
			return null;
		}
		if (typeof key === 'object') {
			return key.map(this._getByKey.bind(this));
		}
		return this._dataKeyCollection.getItem(key);
	}

	_getSelectedItems() {
		return this._getByKey(this.selectedKeys);
	}

	_getIndexById(id) {
		return console.warn('This function has been deprecated and removed.');
	}

	_numberOfColumnsPlusOne() {
		return this._columns.length + 1;
	}

	/**
	 * Method that can be overwritten to apply a custom style to specific rows.
	 *
	 * IMPORTANT: This is a property, not a method you should call directly.
	 */
	customRowStyle(rowItem) {

	}

	_customRowStyle(rowKey) {
		return this.customRowStyle(this._getByKey(rowKey));
	}

	_linkSelectedItem(selectedKey) {
		this.linkPaths('selectedItem', 'data.' + selectedKey);
	}

	_linkSelectedItems() {
		var selectedItemsCollection = new CollectionHelpers(this.selectedItems);
		selectedItemsCollection.getKeys().forEach(function (selectedItemKey, i) {
			this.linkPaths('selectedItems.' + selectedItemKey, 'data.' + this.selectedKeys[i]);
		}.bind(this));
	}

	_triggerDialogResize() {
		this.$.dialog.setLocationRelativeTo();
	}
	_noItemsVisible() {
		if (this._rowKeys) return this._rowKeys.length === 0;
		else return true;
	}

	_isEqual(a, b) {
		return a == b;
	}

	_columnsRendered() {
		this._resizeListener();
	}

	_setPartialSelection() {
		this.set('_partialSelection', this._someChecked());
	}
	/**
	 * Scroll listener from IronScrollTargetBehavior with logic
	 */
	_scrollHandler(e) {
		if (!this.mobileView && this.headerFixed) {
			var tableHead = this.shadowRoot.querySelector('thead');
			if (this._scrollTop > this._theadDistanseToTop && !tableHead.classList.contains("fixedToTop")) {
				/*Get first table row*/
				var firstRow = this.shadowRoot.querySelector('tbody tr');
				// var firstRowCells = Polymer.dom(firstRow).querySelectorAll('.bound-cell');
				var firstRowCells = dom(firstRow).querySelectorAll('.bound-cell');
				if (firstRowCells.length === 0) return;
				var headerWidth = getComputedStyle(tableHead).width;
				var tableHeadRow = tableHead.children[0];
				// var columns = Polymer.dom(tableHeadRow).querySelectorAll('.column');
				var columns = dom(tableHeadRow).querySelectorAll('.column');
				/*Set right width for each column header*/
				Array.prototype.forEach.call(columns, function (item, index) {
					item.style.width = firstRowCells[index].style.width = item.offsetWidth + "px";
				});
				if (this._headerHeight) {
					tableHead.style.top = this._headerHeight + "px";
				}
				this.$.container.style.marginTop = tableHead.offsetHeight + "px";
				tableHead.style.width = headerWidth;
				tableHead.classList.add("fixedToTop");
			} else if (this._scrollTop < this._theadDistanseToTop && tableHead.classList.contains("fixedToTop")) {
				tableHead.style.width = "auto";
				tableHead.style.top = 0;
				this.$.container.style.marginTop = 0;
				tableHead.classList.remove("fixedToTop");
			}
		}
	}
	/**
	 * Set scroll target and coordinates to top
	 */
	_resizeHandler() {
		if (this.headerFixed && !this._theadDistanseToTop) {
			var thead = this.shadowRoot.querySelector('thead');
			var parentNodeName = this.parentNode.nodeName;
			if (parentNodeName.toLowerCase() === 'paper-datatable-card' && this.parentNode.headerFixed) {
				// var header = Polymer.dom(this.parentNode.root).querySelector('#topBlock');
				var header = dom(this.parentNode.root).querySelector('#topBlock');
				this._headerHeight = header.offsetHeight;
				this._theadDistanseToTop = thead.getBoundingClientRect().top - this._headerHeight;
			} else {
				this._theadDistanseToTop = thead.getBoundingClientRect().top;
			}
		}
	}
	_resizeListener() {
		this._resizeHandler();
		this._renderTooltipsIfOverflow();
		this._setDynamicColumnsBySize();
	}
	_setDynamicColumnsBySize() {
		//todo: still needs to be made in to a proper property
		var padding = 28;
		var selectable = this.selectable ? 56 : 0;
		if (this.resizeBehavior == 'dynamic-columns') {
			var allColumns = this.queryAllEffectiveChildren('paper-datatable-column');
			if (allColumns.length > 0) {
				var maxWidth = this.$.container.clientWidth;

				allColumns.sort(function (a, b) {
					if (a.resizePriority === -1 && b.resizePriority === -1) {
						return 0;
					} else if (a.resizePriority === -1) {
						return -1;
					} else if (b.resizePriority === -1) {
						return 1;
					}
					return b.resizePriority - a.resizePriority;
				});

				var widthSoFar = selectable - 2 * padding;
				allColumns.forEach(function (column) {
					if (!column.width) {
						console.error('For dynamic columns to work you have to set the `width` attribute of every column.');
					}
					widthSoFar += parseFloat(column.width) + padding * 2;
					if (widthSoFar > maxWidth && column.resizePriority !== -1) {
						column.set('inactive', true);
					} else {
						column.set('inactive', false);
					}
				});
			}
		}
	}
	_renderTooltipsIfOverflow() {
		if (this.resizeBehavior == 'fixed') {
			if (this._columns.length > 0) {
				var ths = this.shadowRoot.querySelectorAll('th');
				Array.prototype.forEach.call(ths, function (th) {
					if (th.dataColumn) {
						var column = th.dataColumn;
						if (th.scrollWidth > th.offsetWidth) {
							column.set('tooltip', column.header);
						} else {
							column.set('tooltip', '');
						}
					}
				});

			}
		}
	}
	_updateHeaderColumn(event) {
		var column = event.target;
		this.notifyPath('_columns.' + column.index + '.header', this._columns[column.index].header);
	}
}
window.customElements.define(PaperDatatable.is, PaperDatatable);
