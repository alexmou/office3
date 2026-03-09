import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : My workflow 2
// Nodes   : 17  |  Connections: 7
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WhenClickingTestWorkflow           manualTrigger
// HttpRequest                        httpRequest
// Webhook                            webhook
// Code                               code
// Wait                               wait
// WriteLog                           readWriteFile
// CreateLog                          executeCommand             [onError→regular]
// GetSettings                        executeWorkflow
// SystemError                        convertToFile
// ParseChannel                       executeCommand
// If_                                if
// MakeSh                             executeCommand
// ExecuteCommand                     executeCommand
// ExecuteCommand1                    executeCommand
// ExecuteCommand2                    executeCommand
// MakeSh1                            executeCommand
// ReadQr                             readWriteFile
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenClickingTestWorkflow
//    → GetSettings
//      → ParseChannel
//        → If_
//          → CreateLog
//            → SystemError
//              → WriteLog
//      → MakeSh1
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'qSnbVCKDo9anIhNr',
    name: 'My workflow 2',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class MyWorkflow2Workflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'When clicking ‘Test workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-980, -440],
    })
    WhenClickingTestWorkflow = {};

    @node({
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [400, -40],
    })
    HttpRequest = {
        url: 'http://172.17.0.5:5000/health',
        options: {},
    };

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-560, 220],
    })
    Webhook = {
        path: '4fbd59bf-2deb-4fb1-9cb3-b98265c5c0c5',
        options: {},
    };

    @node({
        name: 'Code',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [660, -320],
    })
    Code = {
        jsCode: '\nreturn JSON.parse($input.first().json.stdout)',
    };

    @node({
        name: 'Wait',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [540, 240],
    })
    Wait = {};

    @node({
        name: 'Write log',
        type: 'n8n-nodes-base.readWriteFile',
        version: 1,
        position: [120, -40],
    })
    WriteLog = {
        operation: 'write',
        fileName: "={{ $('Parse Channel').item.json.logsPath }}{{ $('Parse Channel').item.json.ChannelName }}.log\n\n",
        dataPropertyName: '=data',
        options: {},
    };

    @node({
        name: 'Create log',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [500, -540],
        onError: 'continueRegularOutput',
    })
    CreateLog = {
        executeOnce: false,
        command: '=sudo touch {{ $json.logsPath }}{{ $json.ChannelName }}.log',
    };

    @node({
        name: 'Get settings',
        type: 'n8n-nodes-base.executeWorkflow',
        version: 1.2,
        position: [-680, -440],
    })
    GetSettings = {
        workflowId: {
            __rl: true,
            value: 'Pl6Oqey2z3gYBNA7',
            mode: 'list',
            cachedResultName: 'Settings',
        },
        workflowInputs: {
            mappingMode: 'defineBelow',
            value: {},
            matchingColumns: [],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: true,
        },
        options: {},
    };

    @node({
        name: 'system error',
        type: 'n8n-nodes-base.convertToFile',
        version: 1.1,
        position: [-180, -40],
    })
    SystemError = {
        operation: 'toText',
        sourceProperty: 'stderr',
        options: {},
    };

    @node({
        name: 'Parse Channel',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [-180, -580],
    })
    ParseChannel = {
        command: '=bash -x {{ $json.WorkPath }}run_script.sh {{ $json.ChannelName }}',
    };

    @node({
        name: 'If',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [120, -500],
    })
    If_ = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'da2ee150-fd96-48a1-85c0-326aa009d958',
                    leftValue: '={{ $json.error }}',
                    rightValue: '',
                    operator: {
                        type: 'string',
                        operation: 'notEmpty',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'make sh',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [-440, -660],
    })
    MakeSh = {
        executeOnce: '=',
        command:
            '=sudo cat << \'EOF\' > {{ $(\'Get settings\').item.json.WorkPath }}run_script.sh\n#!/usr/bin/env bash\npkill -f chrome\npkill -f chromedriver\npkill -f Xvfb\n\nset -eu\n\n# 1) Явно проставляем PATH, иначе n8n может его «обрезать»\nexport PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n\n# 2) Выводим PATH и проверяем наличие xvfb-run и Xvfb\necho "[DEBUG] PATH=$PATH"\necho "[DEBUG] which xvfb-run: $(which xvfb-run || echo \'NOT FOUND\')"\necho "[DEBUG] which Xvfb:      $(which Xvfb      || echo \'NOT FOUND\')"\necho "[DEBUG] which python3:   $(which python3   || echo \'NOT FOUND\')"\n\n# 3) Подавляем лишние ошибки D-Bus\nexport DBUS_SESSION_BUS_ADDRESS=/dev/null\n\n# 4) Проверяем, что скрипт реально существует\nscript_path="$1"\nchannel="${2:-}"\nif [ ! -f "$script_path" ]; then\n  echo "[ERROR] Script not found at $script_path" >&2\n  exit 1\nfi\necho "[DEBUG] script_path=$script_path"\necho "[DEBUG] channel=$channel"\n\n# 5) Запускаем через полный путь к xvfb-run\n/usr/bin/xvfb-run \\\n  --auto-servernum \\\n  --server-args="-screen 0 1920x1080x24 -ac +extension GLX +render" \\\n  python3 "$script_path" "$channel" 2>&1 | sed \'s/^/[XVFB] /\'\n\necho "[DEBUG] xvfb-run exited with code $?"\n\n\nEOF\n\nchmod +x {{ $(\'Get settings\').item.json.WorkPath }}run_script.sh\n',
    };

    @node({
        name: 'Execute Command',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [780, -680],
    })
    ExecuteCommand = {
        command:
            '=pkill -f chrome\npkill -f chromedriver\npkill -f Xvfb\n\nset -eu\n\n# 1) Явно проставляем PATH, иначе n8n может его «обрезать»\nexport PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n\n# 2) Выводим PATH и проверяем наличие xvfb-run и Xvfb\necho "[DEBUG] PATH=$PATH"\necho "[DEBUG] which xvfb-run: $(which xvfb-run || echo \'NOT FOUND\')"\necho "[DEBUG] which Xvfb:      $(which Xvfb      || echo \'NOT FOUND\')"\necho "[DEBUG] which python3:   $(which python3   || echo \'NOT FOUND\')"\n\n# 3) Подавляем лишние ошибки D-Bus\nexport DBUS_SESSION_BUS_ADDRESS=/dev/null\n\n# 5) Запускаем через полный путь к xvfb-run\n/usr/bin/xvfb-run \\\n  --auto-servernum \\\n  --server-args="-screen 0 1920x1080x24 -ac +extension GLX +render" \\\n  python3 {{ $json.WorkPath }}main.py {{ $json.ChannelName }} 2>&1 | sed \'s/^/[XVFB] /\'\n\necho "[DEBUG] xvfb-run exited with code $?"\n',
    };

    @node({
        name: 'Execute Command1',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [60, -700],
    })
    ExecuteCommand1 = {
        command:
            "=sudo -u l_murygin /usr/bin/xvfb-run --auto-servernum --server-num=1 --server-args='-screen 0, 1920x1080x24' python3 {{ $json.WorkPath }}main.py {{ $json.ChannelName }}\n",
    };

    @node({
        name: 'Execute Command2',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [-960, -100],
    })
    ExecuteCommand2 = {
        command: 'sudo systemctl stop xvfb',
    };

    @node({
        name: 'make sh1',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [-700, -680],
    })
    MakeSh1 = {
        executeOnce: '=',
        command:
            '=sudo cat << \'EOF\' > {{ $(\'Get settings\').item.json.WorkPath }}run_script.sh\n#!/bin/bash\n# Очистка предыдущих процессов\npkill -f "Xvfb" || true\npkill -f "chrome" || true\nrm -rf /tmp/chrome_*\n\n# Запуск с расширенным логированием\n# Перед запуском Python\nexport XVFB_WHD="${XVFB_WHD:-1920x1080x24}"\nXvfb :99 -screen 0 "$XVFB_WHD" -ac +extension RANDR\n\n# Ожидание инициализации\nsleep 2\n\n# Проверка Xvfb\nif ! xdpyinfo -display $DISPLAY >/dev/null 2>&1; then\n  echo "Xvfb failed to start. Log:"\n  cat /tmp/xvfb.log\n  exit 1\nfi\n\n# Основной запуск с перенаправлением логов\nsudo -u l_murygin python3 /home/l_murygin/p8/main.py "$@" > /tmp/parser.log 2>&1\n\n# Проверка результата\nif [ $? -ne 0 ]; then\n  echo "Execution failed. Logs:"\n  echo "=== Xvfb log ==="\n  cat /tmp/xvfb.log\n  echo "=== Parser log ==="\n  cat /tmp/parser.log\n  echo "=== ChromeDriver log ==="\n  cat /tmp/chromedriver.log\nfi\n\n# Очистка\npkill -f "Xvfb"\n\nchmod +x {{ $(\'Get settings\').item.json.WorkPath }}run_script.sh\n',
    };

    @node({
        name: 'read_QR',
        type: 'n8n-nodes-base.readWriteFile',
        version: 1,
        position: [-960, -660],
    })
    ReadQr = {
        fileSelector: '/home/l_murygin/p8/debug_post_parse_error_1745842922.png',
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WhenClickingTestWorkflow.out(0).to(this.GetSettings.in(0));
        this.CreateLog.out(0).to(this.SystemError.in(0));
        this.GetSettings.out(0).to(this.ParseChannel.in(0));
        this.GetSettings.out(0).to(this.MakeSh1.in(0));
        this.SystemError.out(0).to(this.WriteLog.in(0));
        this.ParseChannel.out(0).to(this.If_.in(0));
        this.If_.out(0).to(this.CreateLog.in(0));
    }
}
