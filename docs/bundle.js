!function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r={"vector-caves":n(1).initPost};window.initPost=function(t){return r[t]()}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=function(){function t(e){this.seed=void 0===e?t.M*Math.random():e}return t.prototype.next=function(){this.seed=(t.A*this.seed+t.C)%t.M},t.prototype.value=function(){return this.seed/t.M},t.M=4294967296,t.A=1664525,t.C=1013904223,t}(),o=function(){function t(t,e){this.width=t,this.height=e,this.vals=new Array(t*e)}return t.prototype.write=function(t,e,n){this.vals[t+e*this.width]=n},t.prototype.at=function(t,e){return this.vals[t+e*this.width]},t.prototype.copyFrom=function(t){for(var e=0;e<this.width&&e<t.width;++e)for(var n=0;n<this.height&&n<t.height;++n)this.write(e,n,t.at(e,n))},t}(),i=function(t,e,n){for(var r=0,o=e-1;o<=e+1;++o)for(var i=n-1;i<=n+1;++i)o==e&&i==n||(o<1||i<1||o>=t.width-1||i>=t.height-1?r++:r+=t.at(o,i)?1:0);return r};e.initPost=function(){var t,e,n=document.getElementById("first-canvas").getContext("2d"),u=document.getElementById("seed-slider"),f=document.getElementById("pop-slider"),a=document.getElementById("gen-slider"),c=function(){var t=function(t,e,n,u,f,a,c){for(var l=new o(t,e),s=new o(t,e),d=new r(n),v=0;v<t;++v)for(var h=0;h<e;++h){var p=0===v||0===h||v===t-1||h===e-1||d.value()<u;l.write(v,h,p),s.write(v,h,p),d.next()}for(var y=0;y<c;++y){for(v=1;v<t-1;++v)for(h=1;h<e-1;++h){var w=i(l,v,h);s.write(v,h,w>=(l.at(v,h)?a:f))}l.copyFrom(s)}return l}(150,150,parseInt(u.value),parseFloat(f.value),5,4,parseInt(a.value));n.fillStyle="#FFF",n.fillRect(0,0,300,300),n.fillStyle="#000",function(t,e){for(var n=0;n<t.width;++n)for(var r=0;r<t.height;++r)e(n,r,t.at(n,r))}(t,function(t,e,r){r&&n.fillRect(2*t,2*e,2,2)})};t=["oninput","onchange"],e=c,[f,a,u].forEach(function(n){t.forEach(function(t){n[t]=e})}),c()}}]);
//# sourceMappingURL=bundle.js.map