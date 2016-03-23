'use strict';


var TRACKER = TRACKER || {};

TRACKER.namespace = function(ns) {
    var parts = ns.split('.'),
        parent = TRACKER,
        i;
    if (parts[0] === "TRACKER") {
        parts = parts.slice(1);
    }
    for (i = 0; i < parts.length; i += 1) {
       if (typeof parent[parts[i]] === "undefined") {
           parent[parts[i]] = {};
       }
       parent = parent[parts[i]];
   }
   return parent;
};
