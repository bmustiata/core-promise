/**
 * Grunt project configuration.
 */
module.exports = function(grunt) {
    // configuration for the plugins.
    grunt.initConfig({
        clean: {
            dist : [
                "lib/"
            ]
        },

        typescript: {
            "dist" : {
                options: {
                    module : 'commonjs',
                    sourceMap: true,
                    declaration: true,
                },
                files: [{
                    dest: "lib/core-promise.js",
                    src: [
                        "src/main/core/**/*.ts",
                        "src/main/core/**/*.d.ts"
                    ]
                }]
            }
        }
    });

    // load NPM tasks:
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // register our tasks:
    grunt.registerTask('default', ['clean', 'typescript']);
};

