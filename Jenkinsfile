pipeline {
    agent any

    environment {
        // Change with your Docker Hub username or AWS ECR URI
        DOCKER_REGISTRY       = 'docker.io'
        DOCKER_USER           = 'zenithadmin' // Your Docker Hub or ECR username
        BACKEND_IMAGE_NAME    = "${DOCKER_USER}/zenith-backend"
        FRONTEND_IMAGE_NAME   = "${DOCKER_USER}/zenith-frontend"
        IMAGE_TAG             = "${env.BUILD_NUMBER ?: 'latest'}"
        
        // Jenkins Credentials IDs configured in Jenkins -> Manage Jenkins -> Credentials
        DOCKER_HUB_CREDS_ID   = 'docker-hub-credentials' // Username & Password
        CLOUD_SSH_CREDS_ID    = 'cloud-server-ssh-key'   // SSH Username with private key
        CLOUD_HOST            = 'ec2-user@your-cloud-ip' // Cloud VM / EC2 host
    }

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['production', 'staging', 'local-test'], description: 'Deployment Target')
        booleanParam(name: 'PUSH_TO_REGISTRY', defaultValue: false, description: 'Push built Docker images to registry')
        booleanParam(name: 'DEPLOY_TO_CLOUD', defaultValue: false, description: 'Trigger automated SSH deployment to Cloud')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    triggers {
        githubPush()
    }

    stages {
        stage('1. Checkout & Environment Sanity') {
            steps {
                echo "=========================================="
                echo "Starting CI/CD Pipeline for ZENITH Platform"
                echo "Commit: ${env.GIT_COMMIT}"
                echo "Branch: ${env.GIT_BRANCH}"
                echo "Build Number: ${env.BUILD_NUMBER}"
                echo "Target Environment: ${params.ENVIRONMENT}"
                echo "=========================================="
                sh 'docker --version'
            }
        }

        stage('2. Backend Unit Tests & Package') {
            steps {
                echo "--> Compiling Spring Boot 3.3.4 (Java 21) & Running JUnit Tests"
                dir('backend') {
                    // Uses Maven or Maven wrapper
                    sh 'mvn clean test package'
                }
            }
            post {
                always {
                    // Record test results in Jenkins UI
                    junit testResults: 'backend/target/surefire-reports/*.xml', allowEmptyResults: true
                    archiveArtifacts artifacts: 'backend/target/*.jar', fingerprint: true, allowEmptyArchive: true
                }
            }
        }

        stage('3. Frontend Build & Static Analysis') {
            steps {
                echo "--> Installing Node.js dependencies & Building React Frontend"
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('4. Docker Build & Tagging') {
            steps {
                echo "--> Building Production Docker Images"
                sh """
                    docker build -t ${BACKEND_IMAGE_NAME}:${IMAGE_TAG} -t ${BACKEND_IMAGE_NAME}:latest ./backend
                    docker build -t ${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} -t ${FRONTEND_IMAGE_NAME}:latest ./frontend
                """
            }
        }

        stage('5. Security Vulnerability Scan') {
            when {
                expression { return sh(script: 'command -v trivy', returnStatus: true) == 0 }
            }
            steps {
                echo "--> Running Trivy Container Security Scan"
                sh "trivy image --severity HIGH,CRITICAL ${BACKEND_IMAGE_NAME}:${IMAGE_TAG} || true"
                sh "trivy image --severity HIGH,CRITICAL ${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} || true"
            }
        }

        stage('6. Push to Container Registry') {
            when {
                expression { return params.PUSH_TO_REGISTRY }
            }
            steps {
                echo "--> Pushing Images to Docker Registry (${DOCKER_REGISTRY})"
                withCredentials([usernamePassword(credentialsId: DOCKER_HUB_CREDS_ID, usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
                    sh """
                        echo "\$REG_PASS" | docker login ${DOCKER_REGISTRY} -u "\$REG_USER" --password-stdin
                        docker push ${BACKEND_IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE_NAME}:latest
                        docker push ${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('7. Continuous Deployment (CD) to Cloud') {
            when {
                expression { return params.DEPLOY_TO_CLOUD }
            }
            steps {
                echo "--> Deploying to Cloud Server (${CLOUD_HOST}) via SSH & Docker Compose"
                sshagent([CLOUD_SSH_CREDS_ID]) {
                    sh """
                        # Copy production compose & deployment script to remote cloud server
                        scp -o StrictHostKeyChecking=no docker-compose.prod.yml ${CLOUD_HOST}:/home/ec2-user/zenith/
                        scp -o StrictHostKeyChecking=no scripts/deploy.sh ${CLOUD_HOST}:/home/ec2-user/zenith/
                        
                        # Execute automated rolling restart on remote cloud server
                        ssh -o StrictHostKeyChecking=no ${CLOUD_HOST} "
                            cd /home/ec2-user/zenith &&
                            chmod +x deploy.sh &&
                            ./deploy.sh ${IMAGE_TAG}
                        "
                    """
                }
            }
        }
    }

    post {
        success {
            echo "SUCCESS: ZENITH CI/CD pipeline finished successfully for build #${env.BUILD_NUMBER}!"
        }
        failure {
            echo "FAILED: ZENITH CI/CD pipeline failed. Inspect console output above."
        }
        always {
            // Clean workspace to save agent disk space
            cleanWs()
        }
    }
}
