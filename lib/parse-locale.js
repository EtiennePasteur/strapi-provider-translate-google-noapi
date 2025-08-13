'use strict'

function parseLocale(locale) {
  const unstripped = locale.toUpperCase()
  return unstripped.split('-')[0];
}

module.exports = {
  parseLocale,
}