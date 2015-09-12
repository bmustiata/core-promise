/**
 * Grunt project configuration.
 */
module.exports = function(grunt) {
    // configuration for the plugins.

    // Project name:        core-promise
    // Main ts module:      Promise
    // Source folder:       src/main/ts
    // Tests source folder: src/test/ts
    // Output folder:       lib/
    // Test output folder:  target/test/

    grunt.initConfig({
        clean: {
            dist : [
                "lib/"
            ],

            test : [
                "target/test"
            ]
        },

        typescript: {
            "dist" : {
                options: {
                    module : "commonjs",
                    sourceMap: true,
                    declaration: true,
                },
                files: [{
                    dest: "lib/",
                    src: [
                        "src/main/ts/**/*.ts",
                        "src/main/ts/**/*.d.ts"
                    ]
                }]
            },

            "test" : {
                options: {
                    module : "commonjs",
                    sourceMap: true,
                    declaration: true,
                },
                files: [{
                    dest: "target/test",
                    src: [
                        "src/test/ts/**/*.ts",
                        "src/test/ts/**/*.d.ts"
                    ]
                }]
            }
        },

        dtsGenerator : {
            "dist" : {
                options: {
                    name: "core-promise",
                    baseDir: ".",
                    out: "core-promise.d.ts",
                    main: "core-promise/lib/Promise",
                    excludes: [
                        "node_modules/dts-generator/node_modules/typescript/bin/typescript_internal.d.ts",
                        "node_modules/dts-generator/node_modules/typescript/bin/lib.core.es6.d.ts",
                        "node_modules/dts-generator/node_modules/typescript/bin/lib.es6.d.ts",
                        "node_modules/dts-generator/node_modules/typescript/bin/typescript.d.ts",
                        "node_modules/dts-generator/node_modules/typescript/bin/lib.d.ts",
                        "node_modules/dts-generator/node_modules/typescript/bin/typescriptServices.d.ts",
                        "node_modules/dts-generator/node_modules/typescript/bin/lib.core.d.ts",
                        "node_modules/dts-generator/node_modules/typescript/bin/typescriptServices_internal.d.ts",
                        "node_modules/dts-generator/node_modules/typescript/bin/lib.dom.d.ts",
                        "node_modules/dts-generator/node_modules/typescript/bin/lib.scriptHost.d.ts",
                        "node_modules/dts-generator/node_modules/typescript/bin/lib.webworker.d.ts",

                        "node_modules/grunt-typescript/node_modules/typescript/bin/lib.core.es6.d.ts",
                        "node_modules/grunt-typescript/node_modules/typescript/bin/lib.es6.d.ts",
                        "node_modules/grunt-typescript/node_modules/typescript/bin/typescript.d.ts",
                        "node_modules/grunt-typescript/node_modules/typescript/bin/lib.d.ts",
                        "node_modules/grunt-typescript/node_modules/typescript/bin/typescriptServices.d.ts",
                        "node_modules/grunt-typescript/node_modules/typescript/bin/lib.core.d.ts",
                        "node_modules/grunt-typescript/node_modules/typescript/bin/lib.dom.d.ts",
                        "node_modules/grunt-typescript/node_modules/typescript/bin/lib.scriptHost.d.ts",
                        "node_modules/grunt-typescript/node_modules/typescript/bin/lib.webworker.d.ts",

                        "typings/mocha/mocha.d.ts",
                        "typings/node/node.d.ts"
                    ]
                },

                files : [
                    {
                        expand: true,
                        src: [
                            "lib/*.d.ts"
                        ]
                    }
                ]
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: "spec",
                    captureFile: "target/test/tests_results.txt"
                },
                src: ["target/test/**/*.js"]
            }
        }
    });

    // load NPM tasks:
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-typescript");
    grunt.loadNpmTasks("dts-generator");
    grunt.loadNpmTasks("grunt-mocha-test");

    grunt.registerTask("dist", ["clean:dist", "typescript:dist", "dtsGenerator:dist"]);
    grunt.registerTask("test", ["clean:test", "typescript:test", "mochaTest:test"]);

    // register our tasks:
    grunt.registerTask("default", ["dist", "test"]);
};

