'use strict';

/**
 * Contains the HTML template for tree output
 */
export class OutputTemplate {
	static readonly HTML = `
    <html>
      <head>
      <style>
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

        &:active {
          border-bottom: solid 2px #3595fd;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.30);
        }
      }
      </style>
      </head>
      <body>
        <div class="head">
          <div id="icon-switch" class="btn-ftg"
           onclick="switchVisibility();">
          icon off
          </div>
        </div>
        <pre id="tree-panel">--REP--</pre>
        <script type="text/javascript">
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
        </script>
      </body>
    </html>
    `;
}
