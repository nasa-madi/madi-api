const __flatten = {exports:{}};
((module) => {
    //comment
var m=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var S=Object.getOwnPropertyNames;var w=Object.prototype.hasOwnProperty;var _=(t,e)=>{for(var s in e)m(t,s,{get:e[s],enumerable:!0})},B=(t,e,s,u)=>{if(e&&typeof e=="object"||typeof e=="function")for(let f of S(e))!w.call(t,f)&&f!==s&&m(t,f,{get:()=>e[f],enumerable:!(u=x(e,f))||u.enumerable});return t};var E=t=>B(m({},"__esModule",{value:!0}),t);var N={};_(N,{flatten:()=>A,unflatten:()=>K});module.exports=E(N);function p(t){return t&&t.constructor&&typeof t.constructor.isBuffer=="function"&&t.constructor.isBuffer(t)}function h(t){return t}function A(t,e){e=e||{};const s=e.delimiter||".",u=e.maxDepth,f=e.transformKey||h,y={};function d(b,O,l){l=l||1,Object.keys(b).forEach(function(c){const n=b[c],r=e.safe&&Array.isArray(n),o=Object.prototype.toString.call(n),i=p(n),a=o==="[object Object]"||o==="[object Array]",j=O?O+s+f(c):f(c);if(!r&&!i&&a&&Object.keys(n).length&&(!e.maxDepth||l<u))return d(n,j,l+1);y[j]=n})}return d(t),y}function K(t,e){e=e||{};const s=e.delimiter||".",u=e.overwrite||!1,f=e.transformKey||h,y={};if(p(t)||Object.prototype.toString.call(t)!=="[object Object]")return t;function b(c){const n=Number(c);return isNaN(n)||c.indexOf(".")!==-1||e.object?c:n}function O(c,n,r){return Object.keys(r).reduce(function(o,i){return o[c+s+i]=r[i],o},n)}function l(c){const n=Object.prototype.toString.call(c),r=n==="[object Array]",o=n==="[object Object]";if(c){if(r)return!c.length;if(o)return!Object.keys(c).length}else return!0}return t=Object.keys(t).reduce(function(c,n){const r=Object.prototype.toString.call(t[n]);return!(r==="[object Object]"||r==="[object Array]")||l(t[n])?(c[n]=t[n],c):O(n,c,A(t[n],e))},{}),Object.keys(t).forEach(function(c){const n=c.split(s).map(f);let r=b(n.shift()),o=b(n[0]),i=y;for(;o!==void 0;){if(r==="__proto__")return;const a=Object.prototype.toString.call(i[r]),j=a==="[object Object]"||a==="[object Array]";if(!u&&!j&&typeof i[r]<"u")return;(u&&!j||!u&&i[r]==null)&&(i[r]=typeof o=="number"&&!e.object?[]:{}),i=i[r],n.length>0&&(r=b(n.shift()),o=b(n[0]))}i[r]=K(t[c],e)}),y}

})(__flatten);

const _flatten = __flatten.exports;
let { flatten, unflatten } = _flatten


console.log(flatten)
// { exports: { flatten: [Getter], unflatten: [Getter] } }



// let output = flatten.flatten({ yes: { this: { is: "flat" } } });
// log(output);