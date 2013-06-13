/*
 * cinc - Simple module management for JavaScript
 *
 * Copyright (C) 2013 Denis Gonsiorovsky <dns.gnsr@gmail.com>
 *
 * Licensed under The MIT License
 * http://opensource.org/licenses/MIT
 */

(function(root) {
    /**
     * Modules storage
     *
     * @private
     */

    var modules = {};

    /** 
     * AMD modules list
     *
     * @private
     */

    var amd_modules = [];


    /**
     * Declare a module
     *
     * @global
     * @param {string} module_name A unique name
     *      which will identify your module.
     *      Here you can use everything, for instance, module path:
     *      'lib/tools/wrench.js'
     * @param {Object|Function} module A module object or a constructor
     * @return Nothing
     */

    root.provide = function(module_name, module) {
        // check input
        if (!module_name || !module) {
            return;
        }

        // return if another module with module_name already exists
        // in the storage
        if (module_name in modules) {
            throw 'Another module with the name \'' + module_name + '\' already exists!';
        }

        // if module is a constructor then call it and use
        // its result as module
        if (typeof module === 'function') {
            module = new module;
        }

        // store module
        modules[module_name] = module;

        // show debug info
        if (config.debug) {
            console.log('Module \'' + module_name + '\' defined successfully.');
        }
    };

    /**
     * Include a module
     *
     * @global
     * @param {string} module_name Module name which has been
     *      associated with the module using <i>provide</i> call
     * @param {Array} [options] Extra arguments to be passed
     *      to the init function if any. Default: []
     * @return Module object
     */

    root.use = function(module_name, options) {
        // return if there is no module_name
        if (!module_name) {
            throw 'Module name not supplied!';
        }

        // return if we don't know about such module
        if (!(module_name in modules)) {
            throw 'Module \'' + module_name + '\' has not been declared!';
        }


        // get module
        module = modules[module_name];

        if (!module) {
            return;
        }

        // run init
        if (!(module_name in amd_modules) && module.init && (typeof module.init === 'function')) {
             // check for options
            if (options && !(options instanceof Array)) {
                throw 'Argument \'options\' should be an Array instance!'
            }

            // call init method
            module.init.apply(module, options ? options : []);
        }

        // show debug info
        if (config.debug) {
            console.log('Module \'' + module_name + '\' loaded successfully.');
        }

        return module;
    };

    /**
     * <i>cinc</i> configuration
     * @member {Object} use.config
     * @memberof! use
     * @global
     * @property {boolean} debug Display debug messages
     */

    /**
     * An alias for <i>cinc</i> configuration
     * @member {Object} provide.config
     * @memberof! provide
     * @global
     * @see use.config
     */

    var config = root.use.config = root.provide.config = {
        debug: false
    };

    /**
     * Include multiple modules
     *
     * @global
     * @param {string|Array} module_names Either a regular expression or a list of module names
     *      to include
     * @returns A dictionary containing module names and results of the <i>use</i>
     *      function calls
     */

    root.useall = function(module_names) {
        // vars
        var module_name;
        var results = {};

        if (typeof module_names === 'string') {
            // process regexp
            var re = new RegExp(module_names);
            for (module_name in modules) {
                if (re.test(module_name)) {
                    results[module_name] = use(module_name);
                }
            }
        } else if (module_names instanceof Array) {
            // process modules list
            for (module_name in module_names) {
                results[module_name] = use(context, module_name);
            }
        } else {
            throw 'You should specify either a regular expression or an Array for module list';
        }

        return results;
    };

    /** 
     * AMD <i>define</i> emulation
     *
     * <br/><b>IMPORTANT:</b> This is not a full-featured AMD implementation. It does not have
     * the ability to load external module. This function just appends an AMD module
     * to the <i>cinq</i> storage.
     *
     * <br/><b>NOTE:</b> This function is only available when there is no other AMD realizations found.
     *
     * @global
     * @param {string} module_name A unique name which will identify the module.
     *      <i>cinq</i> does not support anonymous modules, so they will be ignored.
     * @param {Array} deps A list of module's dependencies. For each item in this list function
     *      <i>use</i> will be applied and the results will be passed as arguments to the module's
     *      constructor (if any)
     * @param {Object|Function} module A module object or a constructor
     * @return Nothing
     */

    if (!root.define) {
        root.define = function(module_name, deps, module) {
            // only named modules are supported
            if (typeof module_name !== 'string') {
                console.log('WARNING: cinc does not support anonymous AMD modules. Ignoring.');
                return;
            }

            // return if another module with module_name already exists
            // in the storage
            if (module_name in modules) {
                throw 'Another module with the name \'' + module_name + '\' already exists!';
            }

            // check dependencies
            if (!(deps instanceof Array)) {
                throw 'Dependencies list should be an Array instance!';
            }

            // check just for existance, omit type check
            if (!module) {
                throw 'No module object or constructor specified!';
            }

            // include dependencies
            for (var i = 0, len = deps.length; i < len; i++) {
                deps[i] = use(deps[i]);
            }

            // call constructor
            if (typeof module === 'function') {
                module = new module(deps);
            }

            // store module
            modules[module_name] = module;
            amd_modules.push(module_name);
        };

        // AMD emulation
        root.define.amd = {
            jQuery: true
        }
    }

    /** 
     * AMD <i>require</i> emulation
     *
     * <br/><b>IMPORTANT:</b> This is not a full-featured AMD implementation. It does not have
     * the ability to load external module. This function just extracts AMD modules
     * from the <i>cinq</i> storage and executes the callback.
     *
     * <br/><b>NOTE:</b> This function is only available when there is no other AMD realizations found.
     *
     * @global
     * @param {Array} deps A list of previously defined modules to include.
     * @param {Function} [callback] A function that will be called after modules are included successfully.
     *      This function will be passed loaded module objects as arguments.
     * @return Nothing
     */

    if (!root.require) {
        root.require = function(deps, callback) {
            // check input
            if (!deps || !(deps instanceof Array)) {
                throw 'Dependencies list should be an Array instance!';
            }

            // include dependencies
            for (var i = 0, len = deps.length; i < len; i++) {
                deps[i] = use(deps[i]);
            }

            // execute callback
            if (callback) {
                if (!(typeof callback === 'function')) {
                    throw 'Callback should be a function!';
                }

                callback.apply(this, deps);
            }
        };
    }
}(this));

