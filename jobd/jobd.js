const cfg_ldr = require('./cfg-ldr.js')
const job_runner = require('./job-runner.js')
const tasks = require('./tasks.js')
const logger = require('./logger.js')

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const { program } = require('commander')

const port = 8964

/* parse program arguments */
program
  .usage(`[options]\n` +
  `Example: node ${__filename} --jobs-dir ./test-jobs --config ./config.template.toml`)
  .option('--jobs-dir <jobs directory>', 'specify jobs directory')
  .option('--config <config file path>', 'specify config file')

program.parse(process.argv)

/* load config and jobs */
const jobs_dir = program.jobsDir || './test-jobs'
const cfg_path = program.config || './config.template.toml'

console.log(`Loading: jobs_dir=${jobs_dir}, cfg_path=${cfg_path}`)

var jobs = null
var cfgs = {}

;(async function () {
  jobs = await cfg_ldr.load_jobs(jobs_dir)
  cfgs = await cfg_ldr.load_cfg(cfg_path)
})()

/* setup express HTTP server */
process.on('SIGINT', function() {
  console.log('')
  console.log('Bye bye.')
  process.exit()
})

var app = express()
app.use(bodyParser.json())
app.use(cors())

app.listen(port)
console.log(`Listen on ${port}`)

/* rout handlers for HTTP server */
app
.get('/', async function (req, res) {
  res.json({
    'test': 'hello world'
  })
})

.get('/get/log/:logid', async function (req, res) {
  const id = req.params.logid
  var log = ''

  try {
    logger.read(id,
      data => {
        log += data
      },
      () => {
        res.json({id, log})
      }
    )

  } catch (err) {
    res.json({
      'error': err.toString()
    })
  }
})

.get('/get/job/:jobname', async function (req, res) {
  try {
    const jobname = req.params.jobname
    const props = jobs.getNodeData(jobname)
    res.json({jobname, props})

  } catch (err) {
    res.json({
      'error': err.toString()
    })
  }
})

.get('/get/jobs', async function (req, res) {
  try {
    const all_nodes = jobs.overallOrder()
    const ret_objs = all_nodes.map(n => {
      return {
        name: n,
        props: jobs.getNodeData(n)
      }
    })
    res.json({'res': 'successful', 'jobs': ret_objs})

  } catch (err) {
    res.json({
      'error': err.toString()
    })
  }
})

.get('/get/tasks', async function (req, res) {
  try {
    const all_tasks = await tasks.get_list()
    res.json({all_tasks})

  } catch (err) {
    res.json({
      'error': err.toString()
    })
  }
})

.get('/get/config', async function (req, res) {
  try {
    res.json(cfgs)

  } catch (err) {
    res.json({
      'error': err.toString()
    })
  }
})

.post('/runjob', async function (req, res) {
  try {
    const reqJSON = req.body

    const run_cfg = {
      jobs: jobs,
      envs: cfgs.env,
      dryrun: reqJSON['dry_run'],
      status: reqJSON['status_task'],
      single: reqJSON['single_job'],
      target: reqJSON['goal'] || ''
    }

    const ret = job_runner.run(run_cfg)
    res.json(ret)

  } catch (err) {
    res.json({
      'error': err.toString()
    })
  }
})
