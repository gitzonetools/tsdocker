import * as plugins from './npmdocker.plugins';
import * as paths from './npmdocker.paths';
import * as snippets from './npmdocker.snippets';

const smartshellInstance = new plugins.smartshell.Smartshell({
  executor: 'bash'
});

// interfaces
import { IConfig } from './npmdocker.config';

let config: IConfig;

/**
 * the docker data used to build the internal testing container
 */
let dockerData = {
  imageTag: 'npmdocker-temp-image:latest',
  containerName: 'npmdocker-temp-container',
  dockerProjectMountString: '',
  dockerSockString: '',
  dockerEnvString: ''
};

/**
 * check if docker is available
 */
let checkDocker = () => {
  let done = plugins.smartpromise.defer();
  plugins.beautylog.ora.text('checking docker...');

  if (smartshellInstance.exec('which docker')) {
    plugins.beautylog.ok('Docker found!');
    done.resolve();
  } else {
    done.reject(new Error('docker not found on this machine'));
  }
  return done.promise;
};

/**
 * builds the Dockerfile according to the config in the project
 */
let buildDockerFile = () => {
  let done = plugins.smartpromise.defer();
  plugins.beautylog.ora.text('building Dockerfile...');
  let dockerfile: string = snippets.dockerfileSnippet({
    baseImage: config.baseImage,
    command: config.command
  });
  plugins.beautylog.info(`Base image is: ${config.baseImage}`);
  plugins.beautylog.info(`Command is: ${config.command}`);
  plugins.smartfile.memory.toFsSync(dockerfile, plugins.path.join(paths.cwd, 'npmdocker'));
  plugins.beautylog.ok('Dockerfile created!');
  plugins.beautylog.ora.stop();
  done.resolve();
  return done.promise;
};

/**
 * builds the Dockerimage from the built Dockerfile
 */
let buildDockerImage = async () => {
  plugins.beautylog.info('pulling latest base image from registry...');
  await smartshellInstance.exec(`docker pull ${config.baseImage}`);
  plugins.beautylog.ora.text('building Dockerimage...');
  let execResult = await smartshellInstance.execSilent(
    `docker build -f npmdocker -t ${dockerData.imageTag} ${paths.cwd}`
  );
  if (execResult.exitCode !== 0) {
    console.log(execResult.stdout);
    process.exit(1);
  }
  plugins.beautylog.ok('Dockerimage built!');
};

const buildDockerProjectMountString = async () => {
  if (process.env.CI !== 'true') {
    dockerData.dockerProjectMountString = `-v ${paths.cwd}:/workspace`;
  }
};

/**
 * builds an environment string that docker cli understands
 */
const buildDockerEnvString = async () => {
  for (let keyValueObjectArg of config.keyValueObjectArray) {
    let envString = (dockerData.dockerEnvString =
      dockerData.dockerEnvString + `-e ${keyValueObjectArg.key}=${keyValueObjectArg.value} `);
  }
};

/**
 * creates string to mount the docker.sock inside the testcontainer
 */
const buildDockerSockString = async () => {
  if (config.dockerSock) {
    dockerData.dockerSockString = `-v /var/run/docker.sock:/var/run/docker.sock`;
  }
};

/**
 * creates a container by running the built Dockerimage
 */
let runDockerImage = async () => {
  let done = plugins.smartpromise.defer();
  plugins.beautylog.ora.text('starting Container...');
  plugins.beautylog.ora.end();
  plugins.beautylog.log('now running Dockerimage');
  config.exitCode = (await smartshellInstance.exec(
    `docker run ${dockerData.dockerProjectMountString} ${dockerData.dockerSockString} ${
      dockerData.dockerEnvString
    } --name ${dockerData.containerName} ${dockerData.imageTag}`
  )).exitCode;
};

/**
 * cleans up: deletes the test container
 */
let deleteDockerContainer = async () => {
  await smartshellInstance.execSilent(`docker rm -f ${dockerData.containerName}`);
};

/**
 * cleans up deletes the test image
 */
let deleteDockerImage = async () => {
  await smartshellInstance.execSilent(`docker rmi ${dockerData.imageTag}`).then(async response => {
    if (response.exitCode !== 0) {
      console.log(response.stdout);
    }
  });
};

let preClean = async () => {
  await deleteDockerImage()
    .then(deleteDockerContainer)
    .then(async () => {
      plugins.beautylog.ok('ensured clean Docker environment!');
    });
};

let postClean = async () => {
  await deleteDockerContainer()
    .then(deleteDockerImage)
    .then(async () => {
      plugins.beautylog.ok('cleaned up!');
    });
  plugins.smartfile.fs.removeSync(paths.npmdockerFile);
};

export let run = async (configArg: IConfig): Promise<IConfig> => {
  plugins.beautylog.ora.start();
  config = configArg;
  let resultConfig = await checkDocker()
    .then(preClean)
    .then(buildDockerFile)
    .then(buildDockerImage)
    .then(buildDockerProjectMountString)
    .then(buildDockerEnvString)
    .then(buildDockerSockString)
    .then(runDockerImage)
    .then(postClean)
    .catch(err => {
      console.log(err);
    });
  return config;
};
