# Get the path of the current script
$script_path = split-path -parent $MyInvocation.MyCommand.Definition
Push-Location $script_path


$src_path = "./src"
$src_list = get-childitem $src_path -rec -filter *.js -name
$list = $src_list | % {join-path $src_path $_ }


$build_path = "build/"
$buildname = $build_path + "artmobilib"
$libname = $buildname + ".js"
$libminname = $buildname + ".min.js"


uglifyjs $list -o $libname -b
uglifyjs $list -o $libminname -m -c


Pop-Location