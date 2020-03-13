// Read more: https://jenkins.io/doc/book/pipeline/jenkinsfile/
String cron_string = BRANCH_NAME == "master" ? "@midnight" : ""

pipeline {
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    agent any

    triggers {
        cron(cron_string)
    }

    stages {

        stage('Run Evolene') {
            environment {
                // This env variable avoids the "invalid container name" issue
                COMPOSE_PROJECT_NAME = "${env.BUILD_TAG}"

                // Since a successful run relies on environment varibles being set,
                // we need to skip it for now.
                SKIP_DRY_RUN="True"
            }
            steps {
                sh 'sudo /var/lib/jenkins/chown_jenkins.sh'
                sh 'ls $JENKINS_HOME/workspace/zermatt/jenkins/'
                sh '$JENKINS_HOME/workspace/zermatt/jenkins/buildinfo-to-node-module.sh /config/version.js'
                sh 'SLACK_CHANNELS="#team-e-larande-build,#pipeline-logs" DEBUG=True $EVOLENE_DIRECTORY/run.sh'
                sh 'docker images'
            }
        }
    }
}
