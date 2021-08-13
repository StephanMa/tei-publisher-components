FROM node:lts




RUN  mkdir /var/www
RUN  mkdir /var/www/html 

WORKDIR /var/www/html 

COPY ./ .

RUN npm install
CMD ["npm", "run", "start"]