// require all test files (files that ends with .spec.js)
var testsContext = require.context('.', true, /\.spec$/)
testsContext.keys().forEach(testsContext)
