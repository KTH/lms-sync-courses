// Read more: https://jenkins.io/doc/book/pipeline/jenkinsfile/
String cron_string = BRANCH_NAME == "master" ? "@midnight" : ""

pipeline {
    agent any

    triggers {
        cron(cron_string)
    }

    stages {

        stage('Run Evolene') {
            environment {
                // This env variable avoids the "invalid container name" issue
                COMPOSE_PROJECT_NAME = "${env.BUILD_TAG}"
            }
            steps {
                sh 'ls $JENKINS_HOME/workspace/zermatt/jenkins/'
                sh '$JENKINS_HOME/workspace/zermatt/jenkins/buildinfo-to-node-module.sh /config/version.js'
                sh 'SLACK_CHANNELS="#team-e-larande-build,#pipeline-logs" DEBUG=True EXPERIMENTAL=True $EVOLENE_DIRECTORY/run.sh'
                sh 'docker images'
            }
        }
    }
}
