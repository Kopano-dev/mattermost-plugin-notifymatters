#!/usr/bin/env groovy

pipeline {
	agent {
		docker {
			image 'golang:1.9'
			args '-u 0'
		 }
	}
	environment {
		GLIDE_VERSION = 'v0.13.1'
		GLIDE_HOME = '/tmp/.glide'
		GOBIN = '/usr/local/bin'
		DEBIAN_FRONTEND = 'noninteractive'
	}
	stages {
		stage('Bootstrap') {
			steps {
				echo 'Bootstrapping..'
				sh 'curl -sSL https://github.com/Masterminds/glide/releases/download/$GLIDE_VERSION/glide-$GLIDE_VERSION-linux-amd64.tar.gz | tar -vxz -C /usr/local/bin --strip=1'
				sh 'go get -v github.com/golang/lint/golint'
				sh 'go get -v github.com/tebeka/go2xunit'
			}
		}
		stage('Yarn') {
			steps {
				echo 'Installing Yarn..'
				sh 'apt-get update && apt-get install -y apt-transport-https'
				sh 'curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -'
				sh 'echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list'
				sh 'curl -sL https://deb.nodesource.com/setup_8.x | bash -'
				sh 'apt-get install -y yarn'
			}
		}
		stage('Lint') {
			steps {
				echo 'Linting..'
				sh 'golint \$(glide nv) | tee golint.txt || true'
				sh 'go vet \$(glide nv) | tee govet.txt || true'
				sh 'make webapp-lint-checkstyle || true'
			}
		}
		stage('Build') {
			steps {
				echo 'Building..'
				sh 'make'
				sh 'ls ./bin/notifymattersd'
			}
		}
		stage('Test') {
			steps {
				echo 'Testing..'
				sh 'make test-xml-short'
			}
		}
		stage('Dist') {
			steps {
				echo 'Dist..'
				sh '$(git diff --stat)'
				sh 'test -z "$(git diff --shortstat 2>/dev/null |tail -n1)" && echo "Clean check passed."'
				sh 'make dist'
			}
		}
	}
	post {
		always {
			archive 'dist/*.tar.gz'
			junit allowEmptyResults: true, testResults: 'test/*.xml'
			warnings parserConfigurations: [[parserName: 'Go Lint', pattern: 'golint.txt'], [parserName: 'Go Vet', pattern: 'govet.txt']], unstableTotalAll: '0'
			checkstyle canComputeNew: false, defaultEncoding: '', healthy: '', pattern: 'test/tests.eslint.xml', thresholdLimit: 'high', unHealthy: ''
			cleanWs()
		}
	}
}
