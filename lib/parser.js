"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var importRegexp = /^:import\((.+)\)$/;

var Parser = (function () {
  function Parser(pathFetcher, trace) {
    _classCallCheck(this, Parser);

    this.pathFetcher = pathFetcher;
    this.plugin = this.plugin.bind(this);
    this.exportTokens = {};
    this.translations = {};
    this.trace = trace;
  }

  _createClass(Parser, [{
    key: "plugin",
    value: function plugin(css, result) {
      var _this = this;

      return Promise.all(this.fetchAllImports(css)).then(function (_) {
        return _this.linkImportedSymbols(css);
      }).then(function (_) {
        return _this.extractExports(css);
      });
    }
  }, {
    key: "fetchAllImports",
    value: function fetchAllImports(css) {
      var _this2 = this;

      var imports = [];
      css.each(function (node) {
        if (node.type == "rule" && node.selector.match(importRegexp)) {
          imports.push(_this2.fetchImport(node, css.source.input.from, imports.length));
        }
      });
      return imports;
    }
  }, {
    key: "linkImportedSymbols",
    value: function linkImportedSymbols(css) {
      var _this3 = this;

      css.eachDecl(function (decl) {
        Object.keys(_this3.translations).forEach(function (translation) {
          decl.value = decl.value.replace(translation, _this3.translations[translation]);
        });
      });
    }
  }, {
    key: "extractExports",
    value: function extractExports(css) {
      var _this4 = this;

      css.each(function (node) {
        if (node.type == "rule" && node.selector == ":export") _this4.handleExport(node);
      });
    }
  }, {
    key: "handleExport",
    value: function handleExport(exportNode) {
      var _this5 = this;

      exportNode.each(function (decl) {
        if (decl.type == 'decl') {
          Object.keys(_this5.translations).forEach(function (translation) {
            decl.value = decl.value.replace(translation, _this5.translations[translation]);
          });
          _this5.exportTokens[decl.prop] = decl.value;
        }
      });
      exportNode.removeSelf();
    }
  }, {
    key: "fetchImport",
    value: function fetchImport(importNode, relativeTo, depNr) {
      var _this6 = this;

      var file = importNode.selector.match(importRegexp)[1],
          depTrace = this.trace + String.fromCharCode(depNr);
      return this.pathFetcher(file, relativeTo, depTrace).then(function (exports) {
        importNode.each(function (decl) {
          if (decl.type == 'decl') {
            _this6.translations[decl.prop] = exports[decl.value];
          }
        });
        importNode.removeSelf();
      }, function (err) {
        return console.log(err);
      });
    }
  }]);

  return Parser;
})();

exports["default"] = Parser;
module.exports = exports["default"];