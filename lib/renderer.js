'use strict';

var marked = require('marked');
var assign = require('object-assign');
var stripIndent = require('strip-indent');
var util = require('hexo-util');

var highlight = util.highlight;
var stripHTML = util.stripHTML;
var MarkedRenderer = marked.Renderer;

var Prism = require('prismjs');

function Renderer() {
  MarkedRenderer.apply(this);

  this._headingId = {};
}

require('util').inherits(Renderer, MarkedRenderer);

Renderer.prototype.code = function(code, language) {
  var html = Prism.highlight(code, Prism.languages.javascript), nosidebar = '';
  if(/-content/.test(language)) {
    language = language.replace("-content", '');
    nosidebar = 'nosidebar';
  }
  return `<pre class="highlight ${language} tab-${language} ${nosidebar}"><code>${html}</code></pre>`;
};

// Add id attribute to headings
Renderer.prototype.heading = function(text, level) {
  var id = anchorId(stripHTML(text));
  var headingId = this._headingId;

  // Add a number after id if repeated
  if(id != 'constructor') {
    if (headingId[id]) {
      id += '-' + headingId[id]++;
    } else {
      headingId[id] = 1;
    }
  }
  // add headerlink
  return '<h' + level + ' id="' + id + '"><a href="#' + id + '" class="headerlink" title="' + stripHTML(text) + '"></a>' + text + '</h' + level + '>';
};

function anchorId(str) {
  return util.slugize(str.trim());
}

marked.setOptions({
  langPrefix: '',
  highlight: function(code, lang) {
    return highlight(stripIndent(code), {
      lang: lang,
      gutter: false,
      wrap: false
    });
  }
});

module.exports = function(data, options) {
  return marked(data.text, assign({renderer: new Renderer()}, this.config.marked, options));
};
