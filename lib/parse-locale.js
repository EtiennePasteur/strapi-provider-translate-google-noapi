'use strict'

function parseLocale(locale) {
  const unstripped = locale.toLowerCase();
  return unstripped.split('-')[0];
}

module.exports = {
  parseLocale,
}