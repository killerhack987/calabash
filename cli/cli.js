const axios = require('axios')
const { program } = require('commander')

const DEFAULT_URL = 'http://localhost:8964'

program
  .usage(`<URL> [options]\n` +
  `Example: node ${__filename} --job hello:world http://localhost:8964`)
  .option('-j, --job <job ID>', 'run Job')
  .option('--log <log ID>', 'print job by ID (MASTER, job-<jobID>, or task-<taskID>)')
  .option('--dryrun', 'dryrun mode')
  .option('--single', 'run w/o any dependent job')
  .option('--insist', 'run through jobs even if some dependencies is failed')
  .option('-J, --list-jobs', 'list all jobs')
  .option('--list-config', 'list configuration variables')
  .option('--list-tasks <all | active | unactive>', 'list tasks')
  .option('--show-task <task ID>', 'show specific task')

program.parse(process.argv)

if (program.args.length == 0) {
  program.args.push(DEFAULT_URL)
}

if (program.log) {
  const url = `${program.args[0]}/get/log/${program.log}`
  const options = {}

  axios.get(url, options)
  .then(function (res) {
    const str = JSON.stringify(res.data, null, 2)
    console.log(str)
  })
  .catch(function (err) {
    console.error(err.toString())
  });
}

if (program.listJobs) {
  const url = `${program.args[0]}/get/jobs`
  const options = {}

  axios.get(url, options)
  .then(function (res) {
    const str = JSON.stringify(res.data, null, 2)
    console.log(str)
  })
  .catch(function (err) {
    console.error(err.toString())
  });
}

if (program.listConfig) {
  const url = `${program.args[0]}/get/config`
  const options = {}

  axios.get(url, options)
  .then(function (res) {
    const str = JSON.stringify(res.data, null, 2)
    console.log(str)
  })
  .catch(function (err) {
    console.error(err.toString())
  });
}

if (program.showTask) {
  const taskID = program.showTask
  const url = `${program.args[0]}/get/task/${taskID}`
  const options = {}

  axios.get(url, options)
  .then(function (res) {
    const str = JSON.stringify(res.data, null, 2)
    console.log(str)
  })
  .catch(function (err) {
    console.error(err.toString())
  });
}

if (program.listTasks) {
  const filter = program.listTasks
  const url = `${program.args[0]}/get/tasks/${filter}`
  const options = {}

  axios.get(url, options)
  .then(function (res) {
    const str = JSON.stringify(res.data, null, 2)
    console.log(str)
  })
  .catch(function (err) {
    console.error(err.toString())
  });
}

if (program.job) {
  const url = `${program.args[0]}/runjob`
  const options = {
    goal: program.job,
    dry_run: program.dryrun || false,
    single_job: program.single || false,
    insist_job: program.insist || false
  }

  axios.post(url, options)
  .then(function (res) {
    const str = JSON.stringify(res.data, null, 2)
    console.log(str)
  })
  .catch(function (err) {
    console.error(err.toString())
  });
}
