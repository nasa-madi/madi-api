
/**
 * Modified decoder so that if a value in metadata starts = and matches the numeric regex, it will be parsed as an integer in the query
 */
export const decoder = (str, defaultDecoder, charset, type)=>{
    let numeric = false
    if(str[0]==='='){
      str = str.slice(1)
      numeric = true
    }
    if (numeric&& type === 'value' && /^(?:-(?:[1-9](?:\d{0,2}(?:,\d{3})+|\d*))|(?:0|(?:[1-9](?:\d{0,2}(?:,\d{3})+|\d*))))(?:.\d+|)$/.test(str)) {
      return parseFloat(str);
    }
  
    const keywords = {
      true: true,
      false: false,
      null: null,
      undefined: undefined,
    };
    if (type === 'value' && str in keywords) {
      return keywords[str];
    }
  
    return defaultDecoder(str, defaultDecoder, charset);
}