function compressCacheData(ioData) {
  let tokenList = {
    s: [],
    n: [],
    b: [],
  };

  let uniqueTokenList = {
    s: [],
    n: [],
    b: [],
  };

  let dataString = JSON.stringify(ioData);

  function extractObjectElements(ioObject) {
    function addElement(ioElement) {
      switch (typeof ioElement) {
        case 'string':
          tokenList.s.push(ioElement);
          break;
        case 'number':
          tokenList.n.push(ioElement);
          break;
        case 'boolean':
          tokenList.b.push(ioElement);
          break;
      }
    }

    if (ioObject instanceof Object) {
      Object.keys(ioObject).forEach((ioKey) => {
        if (!Array.isArray(ioObject)) {
          addElement(ioKey);
        }
        extractObjectElements(ioObject[ioKey]);
      });
      return;
    }

    addElement(ioObject);
  }

  function replaceAllTokens() {
    function replaceByTokenType(ioTypeOf, ioArray) {
      function replaceTokens(ioToken, ioIndex) {
        let replacement;
        let search;

        switch (ioTypeOf) {
          case 'string':
            search = new RegExp('\\"' + ioToken.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&") + '\\"', 'g');
            replacement = 'S' + ioIndex.toString();
            break;
          case 'number':
            search = new RegExp(':' + ioToken.toString() + '(?=\,|\]|\})', 'g');
            replacement = ':N' + ioIndex.toString();
            break;
          case 'boolean':
            search = new RegExp(':' + ioToken.toString() + '(?=\,|\]|\})', 'g');
            replacement = ':B' + ioIndex.toString();
            break;
          default:
            return;
        }

        dataString = dataString.replace(search, replacement);
      }

      ioArray.forEach(replaceTokens);
    }

    replaceByTokenType('string', uniqueTokenList.s);
    replaceByTokenType('boolean', uniqueTokenList.b);
    replaceByTokenType('number', uniqueTokenList.n);
  }

  extractObjectElements(ioData);

  uniqueTokenList.s = [...new Set(tokenList.s)];
  uniqueTokenList.n = [...new Set(tokenList.n)];
  uniqueTokenList.b = [...new Set(tokenList.b)];

  replaceAllTokens();

  return {
    decoderRing: uniqueTokenList,
    data: dataString,
  };
}

function decompressCacheData(ioData) {
  function replaceAllTokens() {
    function replaceByTokenType(ioTypeOf, ioArray) {
      function replaceTokens(ioToken, ioIndex) {
        let replacement;
        let search;

        switch (ioTypeOf) {
          case 'string':
            search = new RegExp('S' + ioIndex.toString() + '(?=:|\,|\]|\})', 'g');
            replacement = '\"' + ioToken + '\"';
            break;
          case 'number':
            search = new RegExp(':N' + ioIndex.toString() + '(?=\,|\]|\})', 'g');
            replacement = ':' + ioToken.toString();
            break;
          case 'boolean':
            search = new RegExp(':B' + ioIndex.toString() + '(?=\,|\]|\})', 'g');
            replacement = ':' + ioToken.toString();
            break;
          default:
            return;
        }

        ioData.data = ioData.data.replace(search, replacement);
      }

      ioArray.forEach(replaceTokens);
    }

    replaceByTokenType('number', ioData.decoderRing.n);
    replaceByTokenType('boolean', ioData.decoderRing.b);
    replaceByTokenType('string', ioData.decoderRing.s);
  }

  replaceAllTokens();

  return {
    decoderRing: ioData.decoderRing,
    data: JSON.parse(ioData.data),
  }
}
