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

    var sample = use('helloworld');
    sample.do_it();


Initializing stuff
==================

Inside a module you can define a special method called `init`
which will be called each time function `use` on this module
is executed.

Example
-------

    provide('initsample', function() {
        return {
            init: {
                alert('This is init!');

                // do some initialization
            },
            do_it: {
                alert('This is another method!');

                // do something
            }
        };
    });

    var sample = use('initsample');
    sample.do_it();

