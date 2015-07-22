/**
 * Grunt project configuration.
 */
module.exports = function(grunt) {
    // configuration for the plugins.
    grunt.initConfig({
        clean: {
            dist : [
                "lib/"
            ],

            client : [
                "client/"
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
                    dest: "lib/core-promise.js",
                    src: [
                        "src/main/node/**/*.ts",
                        "src/main/node/**/*.d.ts"
                    ]
                }]
            },

            "client" : {
                options: {
                    module : "amd",
                    sourceMap: true,
                    declaration: true,
                },
                files: [{
                    dest: "client/core-promise.js",
                    src: [
                        "src/main/client/**/*.ts",
                        "src/main/client/**/*.d.ts"
                    ]
                }]
            }
        },

        tsdgen : {
            "dist" : {
                files : [
                    {
                        src: [
                            "lib/core-promise.d.ts"
                        ],
                        dest: "./core-promise.d.ts"
                    }
                ]
            }
        },

        tsdlocal : {
            "dist" : {
                options : {
                    generateDefinitions : true
                },
                files : [
                    {
                        src: [
                            "./core-promise.d.ts"
                        ],
                        dest: "./core-promise.local.d.ts"
                    }
                ]
            }
        }
    });

    // load NPM tasks:
    grunt.loadNpmTasks("grunt-typescript");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("tsdgen");
    grunt.loadNpmTasks("tsdlocal");

    // register our tasks:
    grunt.registerTask("clean-client", ["clean:client"]);
    grunt.registerTask("build-client", ["typescript:client"]);

    grunt.registerTask("clean-dist", ["clean:dist"]);
    grunt.registerTask("build-dist", ["typescript:dist", "tsdgen:dist", "tsdlocal:dist"]);

    grunt.registerTask("client", ["clean-client", "build-client"]);
    grunt.registerTask("dist", ["clean-dist", "build-dist"]);

    grunt.registerTask("default", ["dist", "client"]);
};

