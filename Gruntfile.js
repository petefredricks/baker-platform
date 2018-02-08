module.exports = function(grunt) {

	var pkg = grunt.file.readJSON(__dirname + '/package.json');

	// Project configuration.
	grunt.initConfig({

		pkg: pkg,

		"json-merger": {
			"acceptace": {
				src: [
					"env/acceptance.json",
					"/opt/etc/acceptance/<%= pkg.name %>.json"
				],
				dest: "env/acceptance.json"
			},
			"production": {
				src: [
					"env/production.json",
					"/opt/etc/production/<%= pkg.name %>.json"
				],
				dest: "env/production.json"
			}
		}

	});

	grunt.loadNpmTasks('grunt-json-merger');
	grunt.registerTask('build', ['json-merger']);

	bumpRelease(grunt);
};

// Goosetail version configuration
function bumpRelease(grunt) {

	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('grunt-git');

	grunt.config('gitfetch', {
		origin: {
			options: {
				repository: 'origin'
			}
		}
	});

	grunt.config('gitpull', {
		master: {
			options: {
				branch: 'master'
			}
		},
		develop: {
			options: {
				branch: 'develop'
			}
		}
	});

	grunt.config('gitpush', {
		master: {
			options: {
				branch: 'master',
				tags: true
			}
		},
		develop: {
			options: {
				branch: 'develop',
				tags: true
			}
		}
	});

	grunt.config('gitcheckout', {
		master: {
			options: {
				branch: 'master'
			}
		},
		develop: {
			options: {
				branch: 'develop'
			}
		}
	});

	grunt.config('gitmerge', {
		master: {
			options: {
				branch: 'master',
				commit: true,
				ffOnly: true,
				message: 'Merge branch \'master\' into develop',
				noff: true
			}
		},
		develop: {
			options: {
				branch: 'develop',
				commit: true,
				ffOnly: true,
				message: 'Merge branch \'develop\' in master',
				noff: true
			}
		}
	});

	grunt.config('bump', {
		options: {
			commitMessage: 'Release %VERSION%',
			tagName: '%VERSION%',
			pushTo: 'origin'
		}
	});

	grunt.registerTask('bump-setup', [
		'gitfetch',
		'gitpull:master',
		'gitpull:develop',
		'gitcheckout:master',
		'gitmerge:develop'
	]);

	grunt.registerTask('bump-cleanup', [
		'gitcheckout:develop',
		'gitmerge:master',
		'gitpush:master',
		'gitpush:develop'
	]);

	grunt.registerTask('release-patch', ['bump-setup', 'bump:patch', 'bump-cleanup']);
	grunt.registerTask('release-minor', ['bump-setup', 'bump:minor', 'bump-cleanup']);
	grunt.registerTask('release-major', ['bump-setup', 'bump:major', 'bump-cleanup']);

}