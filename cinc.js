/*
 * cinc - C-like includes for JavaScript
 *
 * Copyright (C) 2013 Denis Gonsiorovsky <dns.gnsr@gmail.com>
 *
 * Licensed under The MIT License
 * http://opensource.org/licenses/MIT
 */

(function(root) {
    /**
     * Modules storage
     * @private
     */
    var modules = {}

    /**
     * Declare a module
     * @global
     * @param {string} module_name A unique name
     *      which will identify your module.
     *      Here you can use everything, for instance, module path:
     *      'lib/tools/wrench.js'
     * @param {Object|Function} obj Module object or factory function
     * @return Nothing
     */
    root.provide = function(module_name, obj) {
        // check input
        if (!module_name || !obj) {
            return;
        }

        // return if another module with module_name already exists
        // in the database
        if ((module_name in modules) && (modules[module_name] === obj)) {
            throw 'Another module with such name already exists!';
        }

        // save module
        modules[module_name] = obj;
    }

    /**
     * Include a module
     * @global
     * @param {string} module_name Module name which has been
     *      associated with the module using `provide` call
     * @param {Array} [options] Extra arguments to be passed
     *      to the module factory function if any. Default: []
     * @param {Object} [context] Context for the factory function
     *      (usually `this` is to be passed).
     *      Default: `this` for `cinc` library (usually `window`).
     *      WARNING: You should use this in conjunction with
     *      the`options` parameter
     * @return Module object
     */
    root.use = function(context, module_name, options) {
        // shift arguments if no context passed
        if (typeof context === 'string') {
            options = module_name;
            module_name = context;
            context = null;
        }

        // return if there is no module_name
        if (!module_name) {
            throw 'Module name not supplied!';
        }

        // return if we don't know about such module
        if (!(module_name in modules)) {
            throw 'Module has not been declared!';
        }

        // get module obj
        module = modules[module_name];

        // if obj is a factory function then call it and use
        // its result as module
        if (typeof module === 'function') {
            // check for options
            if (options && !(options instanceof Array)) {
                throw 'Argument \'options\' should be an Array instance!'
            }

            // call factory function
            module = module.apply(context ? context : this, options ? options : []);
        }

        // return module
        return module;
    }
}(this));

