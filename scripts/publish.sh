set -eu

registry="registry=https://registry.npmjs.org"
registryAuth="//registry.npmjs.org/:_authToken=$NPM_TOKEN"

echo $registry >> .npmrc
echo $registryAuth >> .npmrc
npm publish
