FROM strapi/base 

WORKDIR /srv/app
COPY package.json .
COPY yarn.lock .

# Install dependencies, but not generate a yarn.lock file and fail if an update is needed (for more : https://classic.yarnpkg.com/en/docs/cli/install/#toc-yarn-install-frozen-lockfile).
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 1337

CMD ["yarn", "strapi", "develop"]
