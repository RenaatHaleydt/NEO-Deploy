#!groovy

@Library('piper-lib-os') _

pipeline {
     agent any

      stages {
         stage('Build') {
             steps {
                 sh 'npm install'
	     }
         }
         stage('Automated tests') {
             steps {
             	 sh 'npm run karma'
             }
         }
	stage('Ready to deploy') {
             steps {
                 sh 'export PATH=${WORKSPACE}/node_modules/grunt/bin:$PATH'
                 sh 'java -jar /MTA/mta.jar --mtar bachelorproef.mtar --build-target=NEO build'               
             }
         }
     }
 }