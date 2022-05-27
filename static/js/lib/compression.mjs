"use strict";for(var u8=Uint8Array,u16=Uint16Array,u32=Uint32Array,rev=new u16(32768),i=0;i<32768;++i){var x=(43690&i)>>>1|(21845&i)<<1;x=(61680&(x=(52428&x)>>>2|(13107&x)<<2))>>>4|(3855&x)<<4,rev[i]=((65280&x)>>>8|(255&x)<<8)>>>1}var hMap=function(r,e,t){for(var n=r.length,f=0,a=new u16(e);f<n;++f)r[f]&&++a[r[f]-1];var i,l=new u16(e);for(f=0;f<e;++f)l[f]=l[f-1]+a[f-1]<<1;if(t){i=new u16(1<<e);var o=15-e;for(f=0;f<n;++f)if(r[f])for(var u=f<<4|r[f],v=e-r[f],s=l[r[f]-1]++<<v,c=s|(1<<v)-1;s<=c;++s)i[rev[s]>>>o]=u}else for(i=new u16(n),f=0;f<n;++f)r[f]&&(i[f]=rev[l[r[f]-1]++]>>>15-r[f]);return i},fleb=new u8([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),fdeb=new u8([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),clim=new u8([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),flt=new u8(288);for(i=0;i<144;++i)flt[i]=8;for(i=144;i<256;++i)flt[i]=9;for(i=256;i<280;++i)flt[i]=7;for(i=280;i<288;++i)flt[i]=8;var fdt=new u8(32);for(i=0;i<32;++i)fdt[i]=5;var flm=hMap(flt,9,0),flrm=hMap(flt,9,1),fdm=hMap(fdt,5,0),fdrm=hMap(fdt,5,1),et=new u8(0),shft=function(r){return(r+7)/8|0},wbits=function(r,e,t){t<<=7&e;var n=e/8|0;r[n]|=t,r[n+1]|=t>>>8},wbits16=function(r,e,t){t<<=7&e;var n=e/8|0;r[n]|=t,r[n+1]|=t>>>8,r[n+2]|=t>>>16},wfblk=function(r,e,t){var n=t.length,f=shft(e+2);r[f]=255&n,r[f+1]=n>>>8,r[f+2]=255^r[f],r[f+3]=255^r[f+1];for(var a=0;a<n;++a)r[f+a+4]=t[a];return 8*(f+4+n)},hTree=function(r,e){for(var t=[],n=0;n<r.length;++n)r[n]&&t.push({s:n,f:r[n]});var f=t.length,a=t.slice();if(!f)return[et,0];if(1==f){var i=new u8(t[0].s+1);return i[t[0].s]=1,[i,1]}t.sort(function(r,e){return r.f-e.f}),t.push({s:-1,f:25001});var l=t[0],o=t[1],u=0,v=1,s=2;for(t[0]={s:-1,f:l.f+o.f,l:l,r:o};v!=f-1;)l=t[t[u].f<t[s].f?u++:s++],o=t[u!=v&&t[u].f<t[s].f?u++:s++],t[v++]={s:-1,f:l.f+o.f,l:l,r:o};var c=a[0].s;for(n=1;n<f;++n)a[n].s>c&&(c=a[n].s);var b=new u16(c+1),h=ln(t[v-1],b,0);if(h>e){n=0;var d=0,w=h-e,m=1<<w;for(a.sort(function(r,e){return b[e.s]-b[r.s]||r.f-e.f});n<f;++n){var g=a[n].s;if(!(b[g]>e))break;d+=m-(1<<h-b[g]),b[g]=e}for(d>>>=w;d>0;){var p=a[n].s;b[p]<e?d-=1<<e-b[p]++-1:++n}for(;n>=0&&d;--n){var x=a[n].s;b[x]==e&&(--b[x],++d)}h=e}return[new u8(b),h]},ln=function(r,e,t){return-1==r.s?Math.max(ln(r.l,e,t+1),ln(r.r,e,t+1)):e[r.s]=t},lc=function(r){for(var e=r.length;e&&!r[--e];);for(var t=new u16(++e),n=0,f=r[0],a=1,i=function(r){t[n++]=r},l=1;l<=e;++l)if(r[l]==f&&l!=e)++a;else{if(!f&&a>2){for(;a>138;a-=138)i(32754);a>2&&(i(a>10?a-11<<5|28690:a-3<<5|12305),a=0)}else if(a>3){for(i(f),--a;a>6;a-=6)i(8304);a>2&&(i(a-3<<5|8208),a=0)}for(;a--;)i(f);a=1,f=r[l]}return[t.subarray(0,n),e]},clen=function(r,e){for(var t=0,n=0;n<e.length;++n)t+=r[n]*e[n];return t},wblk=function(r,e,t,n,f,a,i,l,o,u,v){wbits(e,v++,t),++f[256];for(var s=hTree(f,15),c=s[0],b=s[1],h=hTree(a,15),d=h[0],w=h[1],m=lc(c),g=m[0],p=m[1],x=lc(d),M=x[0],k=x[1],y=new u16(19),E=0;E<g.length;++E)y[31&g[E]]++;for(E=0;E<M.length;++E)y[31&M[E]]++;for(var T=hTree(y,7),C=T[0],S=T[1],_=19;_>4&&!C[clim[_-1]];--_);var A,U,F,B,D=u+5<<3,L=clen(f,flt)+clen(a,fdt)+i,N=clen(f,c)+clen(a,d)+i+14+3*_+clen(y,C)+(2*y[16]+3*y[17]+7*y[18]);if(D<=L&&D<=N)return wfblk(e,v,r.subarray(o,o+u));if(wbits(e,v,1+(N<L)),v+=2,N<L){A=hMap(c,b,0),U=c,F=hMap(d,w,0),B=d;var P=hMap(C,S,0);wbits(e,v,p-257),wbits(e,v+5,k-1),wbits(e,v+10,_-4),v+=14;for(E=0;E<_;++E)wbits(e,v+3*E,C[clim[E]]);v+=3*_;for(var R=[g,M],Y=0;Y<2;++Y){var z=R[Y];for(E=0;E<z.length;++E){var O=31&z[E];wbits(e,v,P[O]),v+=C[O],O>15&&(wbits(e,v,z[E]>>>5&127),v+=z[E]>>>12)}}}else A=flm,U=flt,F=fdm,B=fdt;for(E=0;E<l;++E)if(n[E]>255){O=n[E]>>>18&31;wbits16(e,v,A[O+257]),v+=U[O+257],O>7&&(wbits(e,v,n[E]>>>23&31),v+=fleb[O]);var j=31&n[E];wbits16(e,v,F[j]),v+=B[j],j>3&&(wbits16(e,v,n[E]>>>5&8191),v+=fdeb[j])}else wbits16(e,v,A[n[E]]),v+=U[n[E]];return wbits16(e,v,A[256]),v+U[256]},slc=function(r,e,t){(null==e||e<0)&&(e=0),(null==t||t>r.length)&&(t=r.length);var n=new(2==r.BYTES_PER_ELEMENT?u16:4==r.BYTES_PER_ELEMENT?u32:u8)(t-e);return n.set(r.subarray(e,t)),n},freb=function(r,e){for(var t=new u16(31),n=0;n<31;++n)t[n]=e+=1<<r[n-1];var f=new u32(t[30]);for(n=1;n<30;++n)for(var a=t[n];a<t[n+1];++a)f[a]=a-t[n]<<5|n;return[t,f]},_a=freb(fleb,2),fl=_a[0],revfl=_a[1];fl[28]=258,revfl[258]=28;var _b=freb(fdeb,0),fd=_b[0],revfd=_b[1],deo=new u32([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),dflt=function(r,e,t,n,f,a){var i=r.length,l=new u8(n+i+5*(1+Math.ceil(i/7e3))+f),o=l.subarray(n,l.length-f),u=0;if(!e||i<8)for(var v=0;v<=i;v+=65535){var s=v+65535;s>=i&&(o[u>>3]=a),u=wfblk(o,u+1,r.subarray(v,s))}else{for(var c=deo[e-1],b=c>>>13,h=8191&c,d=(1<<t)-1,w=new u16(32768),m=new u16(d+1),g=Math.ceil(t/3),p=2*g,x=function(e){return(r[e]^r[e+1]<<g^r[e+2]<<p)&d},M=new u32(25e3),k=new u16(288),y=new u16(32),E=0,T=0,C=(v=0,0),S=0,_=0;v<i;++v){var A=x(v),U=32767&v,F=m[A];if(w[U]=F,m[A]=U,S<=v){var B=i-v;if((E>7e3||C>24576)&&B>423){u=wblk(r,o,0,M,k,y,T,C,_,v-_,u),C=E=T=0,_=v;for(var D=0;D<286;++D)k[D]=0;for(D=0;D<30;++D)y[D]=0}var L=2,N=0,P=h,R=U-F&32767;if(B>2&&A==x(v-R))for(var Y=Math.min(b,B)-1,z=Math.min(32767,v),O=Math.min(258,B);R<=z&&--P&&U!=F;){if(r[v+L]==r[v+L-R]){for(var j=0;j<O&&r[v+j]==r[v+j-R];++j);if(j>L){if(L=j,N=R,j>Y)break;var q=Math.min(R,j-2),G=0;for(D=0;D<q;++D){var H=v-R+D+32768&32767,I=H-w[H]+32768&32767;I>G&&(G=I,F=H)}}}R+=(U=F)-(F=w[U])+32768&32767}if(N){M[C++]=268435456|revfl[L]<<18|revfd[N];var J=31&revfl[L],K=31&revfd[N];T+=fleb[J]+fdeb[K],++k[257+J],++y[K],S=v+L,++E}else M[C++]=r[v],++k[r[v]]}}u=wblk(r,o,a,M,k,y,T,C,_,v-_,u),!a&&7&u&&(u=wfblk(o,u+1,et))}return slc(l,0,n+shft(u)+f)},dopt=function(r,e,t,n,f){return dflt(r,null==e.level?6:e.level,null==e.mem?Math.ceil(1.5*Math.max(8,Math.min(13,Math.log(r.length)))):12+e.mem,t,n,!f)};export function deflateSync(r,e){return dopt(r,e||{},0,0)}var max=function(r){for(var e=r[0],t=1;t<r.length;++t)r[t]>e&&(e=r[t]);return e},bits=function(r,e,t){var n=e/8|0;return(r[n]|r[n+1]<<8)>>(7&e)&t},bits16=function(r,e){var t=e/8|0;return(r[t]|r[t+1]<<8|r[t+2]<<16)>>(7&e)},ec=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],err=function(r,e,t){var n=new Error(e||ec[r]);if(n.code=r,Error.captureStackTrace&&Error.captureStackTrace(n,err),!t)throw n;return n},inflt=function(r,e,t){var n=r.length;if(!n||t&&t.f&&!t.l)return e||new u8(0);var f=!e||t,a=!t||t.i;t||(t={}),e||(e=new u8(3*n));var i=function(r){var t=e.length;if(r>t){var n=new u8(Math.max(2*t,r));n.set(e),e=n}},l=t.f||0,o=t.p||0,u=t.b||0,v=t.l,s=t.d,c=t.m,b=t.n,h=8*n;do{if(!v){l=bits(r,o,1);var d=bits(r,o+1,3);if(o+=3,!d){var w=r[(S=shft(o)+4)-4]|r[S-3]<<8,m=S+w;if(m>n){a&&err(0);break}f&&i(u+w),e.set(r.subarray(S,m),u),t.b=u+=w,t.p=o=8*m,t.f=l;continue}if(1==d)v=flrm,s=fdrm,c=9,b=5;else if(2==d){var g=bits(r,o,31)+257,p=bits(r,o+10,15)+4,x=g+bits(r,o+5,31)+1;o+=14;for(var M=new u8(x),k=new u8(19),y=0;y<p;++y)k[clim[y]]=bits(r,o+3*y,7);o+=3*p;var E=max(k),T=(1<<E)-1,C=hMap(k,E,1);for(y=0;y<x;){var S,_=C[bits(r,o,T)];if(o+=15&_,(S=_>>>4)<16)M[y++]=S;else{var A=0,U=0;for(16==S?(U=3+bits(r,o,3),o+=2,A=M[y-1]):17==S?(U=3+bits(r,o,7),o+=3):18==S&&(U=11+bits(r,o,127),o+=7);U--;)M[y++]=A}}var F=M.subarray(0,g),B=M.subarray(g);c=max(F),b=max(B),v=hMap(F,c,1),s=hMap(B,b,1)}else err(1);if(o>h){a&&err(0);break}}f&&i(u+131072);for(var D=(1<<c)-1,L=(1<<b)-1,N=o;;N=o){var P=(A=v[bits16(r,o)&D])>>>4;if((o+=15&A)>h){a&&err(0);break}if(A||err(2),P<256)e[u++]=P;else{if(256==P){N=o,v=null;break}var R=P-254;if(P>264){var Y=fleb[y=P-257];R=bits(r,o,(1<<Y)-1)+fl[y],o+=Y}var z=s[bits16(r,o)&L],O=z>>>4;z||err(3),o+=15&z;B=fd[O];if(O>3){Y=fdeb[O];B+=bits16(r,o)&(1<<Y)-1,o+=Y}if(o>h){a&&err(0);break}f&&i(u+131072);for(var j=u+R;u<j;u+=4)e[u]=e[u-B],e[u+1]=e[u+1-B],e[u+2]=e[u+2-B],e[u+3]=e[u+3-B];u=j}}t.l=v,t.p=N,t.b=u,t.f=l,v&&(l=1,t.m=c,t.d=s,t.n=b)}while(!l);return u==e.length?e:slc(e,0,u)};export function inflateSync(r,e){return inflt(r,e)}var te="undefined"!=typeof TextEncoder&&new TextEncoder,td="undefined"!=typeof TextDecoder&&new TextDecoder,dutf8=function(r){for(var e="",t=0;;){var n=r[t++],f=(n>127)+(n>223)+(n>239);if(t+f>r.length)return[e,slc(r,t-1)];f?3==f?(n=((15&n)<<18|(63&r[t++])<<12|(63&r[t++])<<6|63&r[t++])-65536,e+=String.fromCharCode(55296|n>>10,56320|1023&n)):e+=1&f?String.fromCharCode((31&n)<<6|63&r[t++]):String.fromCharCode((15&n)<<12|(63&r[t++])<<6|63&r[t++]):e+=String.fromCharCode(n)}};export function strToU8(r,e){if(e){for(var t=new u8(r.length),n=0;n<r.length;++n)t[n]=r.charCodeAt(n);return t}if(te)return te.encode(r);var f=r.length,a=new u8(r.length+(r.length>>1)),i=0,l=function(r){a[i++]=r};for(n=0;n<f;++n){if(i+5>a.length){var o=new u8(i+8+(f-n<<1));o.set(a),a=o}var u=r.charCodeAt(n);u<128||e?l(u):u<2048?(l(192|u>>6),l(128|63&u)):u>55295&&u<57344?(l(240|(u=65536+(1047552&u)|1023&r.charCodeAt(++n))>>18),l(128|u>>12&63),l(128|u>>6&63),l(128|63&u)):(l(224|u>>12),l(128|u>>6&63),l(128|63&u))}return slc(a,0,i)}export function strFromU8(r,e){if(e){for(var t="",n=0;n<r.length;n+=16384)t+=String.fromCharCode.apply(null,r.subarray(n,n+16384));return t}if(td)return td.decode(r);var f=dutf8(r),a=f[0];return f[1].length&&err(8),a}