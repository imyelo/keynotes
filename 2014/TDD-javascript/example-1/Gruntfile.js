module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mochacli: {
      app: ['./test']
    },
    watch: {
      test: {
        files: ['./src/**/**.js', './test/**/**.js'],
        tasks: ['mochacli']
      },
    },
  });

  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['watch']);

};