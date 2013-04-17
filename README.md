Getting started
===============

This library implements a mechanism of JS modules definition and inclusion similar
to the C language and RequireJS. It provides two global functions: `provide` and `use`.

Function `provide` is used to declare a module but hide it from the global scope.
Function `use` is used to inject a module into the current scope.

Example
-------

    provide('helloworld', function() {
        var hw = {};
        var message = 'Hello, %username%!';
        
        hw.do_it = function() {
            alert(message);
        };

        return hw;
    });

    var HW = use('helloworld');
    HW.do_it();

    
