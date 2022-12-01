const pm2m = require('../../Pm2Management/manager').pm2Manager()
const {getProfile} = require('../../../Launch-Profiles/ProfileRoot')

exports.platformCommand = function platformCommand() {
    const thisObject = {
        name: 'platform',
        description: 'Runs the platform app',
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return cmd.option('minMemo', {
            boolean: true,
            default: false
        }).option('noBrowser', {
            boolean: true,
            default: false
        }).option('profile', {
            description: 'A custom profile to apply to the process being started',
            string: true
        })
    }

    function runner(args) {
        const arguments = []
        if(args.minMemo) { arguments.push('minMemo') }
        if(args.noBrowser) { arguments.push('noBrowser') }

        const name = args.profile !== undefined ? 'sa-' + args.profile + '-platform' : 'sa-default-platform'
        const startProcess = {
            script: 'platform.js',
            name,
            args: arguments,
            cwd: path.join(__dirname),
            log_file: path.join(__dirname, 'My-Log-Files', 'pm2', 'platform-console.log')
        }

        if(args.profile !== undefined) {
            startProcess.env = { 
                'PROFILE_NAME': args.profile 
            }
            const profile = getProfile(args.profile)
            if(profile !== undefined && profile.storeLogs !== undefined) {
                startProcess.log_file = path.join(profile.storeLogs, 'pm2', 'platform-console.log')
            }
        }
        
        console.log('[INFO] Platform app starting with the following options: ', JSON.stringify(arguments))
        console.log('[INFO] Platform app pm2 logs location: ' + startProcess.log_file)

        pm2m.connect()
            .then(() => pm2m.start(startProcess))
            .then(() => pm2m.disconnect())
    }
}