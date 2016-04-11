# Get the path of the current script
$script_path = split-path -parent $MyInvocation.MyCommand.Definition
Push-Location $script_path

jsdoc ../src --recurse --destination ../doc

Pop-Location