'use strict'

const jsdom = require('jsdom')
const Bottleneck = require('bottleneck/es5')
const {
  GOOGLE_API_MAX_TEXTS,
  GOOGLE_API_ROUGH_MAX_REQUEST_SIZE,
  GOOGLE_PRIORITY_DEFAULT,
} = require('./constants')
const { parseLocale } = require('./parse-locale')
const { getService } = require('./get-service')

module.exports = {
  provider: 'google-noapi',
  name: 'Google Translate No API',

  init() {
    const limiter = new Bottleneck({
      minTime: 200,
      maxConcurrent: 5,
    })

    const rateLimitedTranslate = limiter.wrap(async (text, target, source) => {
      console.log(text);
      const res = await fetch(`https://translate.google.com/m?sl=${source}&tl=${target}&q=${encodeURI(text)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'html/text',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            },
        })
        if (!res.ok) {
            throw new Error(`Response status: ${res.status}`)
        }

        const html = await res.text()
        const dom = new jsdom.JSDOM(html)
        const translation = dom.window.document.querySelector('.result-container').textContent;
        console.log(`-----\n${translation}\n-----`)
        return translation;
    });

    return {
      /**
       * @param {{
       *  text:string|string[],
       *  sourceLocale: string,
       *  targetLocale: string,
       *  priority: number,
       *  format?: 'plain'|'markdown'|'html'
       * }} options all translate options
       * @returns {string[]} the input text(s) translated
       */
      async translate({ text, priority, sourceLocale, targetLocale, format }) {
        if (!text) return [];

        if (!sourceLocale || !targetLocale) throw new Error('source and target locale must be defined');

        const chunksService = getService('chunks');
        const formatService = getService('format');

        let textArray = Array.isArray(text) ? text : [text];

        if (format === 'markdown') {
          textArray = formatService.markdownToHtml(textArray);
        }

        const { chunks, reduceFunction } = chunksService.split(textArray, {
          maxLength: GOOGLE_API_MAX_TEXTS,
          maxByteSize: GOOGLE_API_ROUGH_MAX_REQUEST_SIZE
        });

        const result = reduceFunction(
          await Promise.all(
            chunks.map(async (texts) => {
              return Promise.all(
                texts.map((t) =>
                  rateLimitedTranslate.withOptions(
                    { priority: typeof priority === 'number' ? priority : GOOGLE_PRIORITY_DEFAULT },
                    t,
                    parseLocale(targetLocale),
                    parseLocale(sourceLocale)
                  )
                )
              );
            })
          )
        );


        if (format === 'markdown') {
          return formatService.htmlToMarkdown(result)
        }

        return result
      },
      async usage() {
        return { count: 0, limit: 999999 };
      },
    }
  },
}


