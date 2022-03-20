const {TwingEnvironment, TwingLoaderFilesystem} = require('twing')

const loader = new TwingLoaderFilesystem('./views')
module.exports = new TwingEnvironment(loader)