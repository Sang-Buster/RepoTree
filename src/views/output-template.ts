'use strict';

/**
 * Contains the HTML template for tree output
 */
export class OutputTemplate {
	static readonly HTML = `
    <html>
      <head>
      <style>
      .head {
        margin-top: 15px;
        margin-bottom: 15px;
      }
      .btn-ftg {
        position: relative;
        display: inline-block;
        padding: 0.25em 0.5em;
        text-decoration: none;
        color: #FFF;
        background: #3595fd;
        border-bottom: solid 2px #007dd2;
        border-radius: 4px;
        box-shadow: inset 0 2px 0 rgba(255,255,255,0.2), 0 2px 2px rgba(0, 0, 0, 0.19);
        font-weight: bold;
        -webkit-user-select: none;
        -moz-user-select: none;
         -ms-user-select: none;
             user-select: none;
        margin-right: 10px;

        &:active {
          border-bottom: solid 2px #3595fd;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.30);
        }
      }
      .comment {
        color: #6A9955;
        font-style: italic;
        white-space: pre;
      }
      </style>
      </head>
      <body>
        <div class="head">
          <div id="icon-switch" class="btn-ftg"
           onclick="switchVisibility();">
          icon off
          </div>
          <div id="append-readme" class="btn-ftg"
           onclick="appendToReadme();">
          Append to README
          </div>
        </div>
        <pre id="tree-panel">--REP--</pre>
        <script type="text/javascript">
            const vscode = acquireVsCodeApi();
            
            function switchVisibility() {
                var mode = document.getElementById("icon-switch").textContent;
                var iconList = document.getElementsByName("icons");
                var visible = "inline";
                if (mode != 'icon on') {
                    document.getElementById("icon-switch").textContent = 'icon on'
                    visible = "none";
                } else {
                    document.getElementById("icon-switch").textContent = 'icon off'
                }
                iconList.forEach(icon => {
                    icon.style.display = visible;
                });
            }
            
            function appendToReadme() {
                const treeContent = document.getElementById("tree-panel").innerHTML;
                const iconMode = document.getElementById("icon-switch").textContent.trim();
                
                // Check if any icons are currently displayed
                const iconsDisplayed = document.querySelector('.t-icon[style="display: none;"]') === null;
                
                console.log('Icon mode:', iconMode, 'Icons displayed:', iconsDisplayed);
                
                vscode.postMessage({
                    command: 'appendToReadme',
                    treeContent: treeContent,
                    includeIcons: iconsDisplayed
                });
            }
        </script>
      </body>
    </html>
    `;
}
