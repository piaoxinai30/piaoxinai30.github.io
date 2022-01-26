// Constants

let rpQuestionItemList = [
    '.q2-rp',
    '.q3-rp',
    '.q4-rp'
]

let oQuestionItemList = [
    '.q2-o',
    '.q3-o',
    '.q4-o',
    '.q5-o'
]

let questionItemList = rpQuestionItemList.concat(oQuestionItemList);

let questionItemToNextQuestionMapping = {
    '.q2-rp': ".question3",
    '.q3-rp': ".question4",
    '.q4-rp': ".output",

    '.q2-o': ".question3",
    '.q3-o': ".question4",
    '.q4-o': ".question5",
    '.q5-o': ".output"
}

// Main function

$(document).ready(function() {
    $('.q1').click(function() {
        $('.q1').each(function(idx) {
            $('.q1').removeClass('selected');
        });
        $(this).toggleClass('selected');
        var id = $(this).attr("id");
        if(id == "other") {
            $('.others').removeClass('hidden');
            $('.research_or_production').addClass('hidden');
        } else {
            $('.others').addClass('hidden');
            $('.research_or_production').removeClass('hidden');
        }
    });

    $('.item').hover(function() {
        $(this).addClass('hover');
    }, function() {
        $(this).removeClass('hover');
    });

    for(let i in questionItemList) {
        let q = questionItemList[i];
        $(q).click(function() {
            $(q).each(function(idx) {
                $(q).removeClass('selected');
            });
            $(this).toggleClass('selected');

            let nextQ = questionItemToNextQuestionMapping[q];
            $(nextQ).removeClass('hidden');
            $('html, body').animate({
                scrollTop: $(nextQ).offset().top
            }, 2000);
        })
    }

    function generateCondaString(type, dict) {
        var outString = "conda install pytorch torchvision torchaudio";
        var compute;
        var user;
        var os;
        if(type == "rp") {
            user = dict['.q1'];
            os = dict[".q2-rp"];
            compute = dict[".q3-rp"];
        } else {
            user = dict['.q2-o'];
            os = dict[".q3-o"];
            compute = dict[".q4-o"];
        }

        var computeMapping = {
            "CUDA_102": "cudatoolkit=10.2",
            "CUDA_113": "cudatoolkit=11.3"
        }

        var computeString = "";

        switch(compute) {
            case "CPU":
                if(os != "mac" ) {
                    computeString = "cpuonly"
                } else {
                    computeString = ""
                }
                break;
            case "ROCM_4":
                if(user == "production") {
                    return "NOTE: ROCm is not supported in LTS"
                } else {
                    return "NOTE: Conda packages are not currently available for ROCm, please use pip instead"
                }
                break;
            default:
                computeString = computeMapping[compute];
                break
        }
        outString += " " + computeString + " "

        switch(user) {
            case "research":
                outString += " -c pytorch";
                break;
            case "production":
                outString += " -c pytorch-lts";
                break;
            case "nightly":
                outString += " -c pytorch-nightly";
                break;
        }
        return outString;
    }

    function generatePipString(type, dict) {
        var compute;
        var user;
        var os;
        if(type == "rp") {
            user = dict['.q1'];
            os = dict[".q2-rp"];
            compute = dict[".q3-rp"];
        } else {
            user = dict['.q2-o'];
            os = dict[".q3-o"];
            compute = dict[".q4-o"];
        }
        
        let researcherMapping = {
            "linux": {
                "CUDA_102": "pip3 install torch torchvision torchaudio",
                "CUDA_113": "pip3 install torch==1.10.1+cu113 torchvision==0.11.2+cu113 torchaudio==0.10.1+cu113 -f https://download.pytorch.org/whl/cu113/torch_stable.html",
                "ROCM_4": "pip3 install torch torchvision==0.11.2 -f https://download.pytorch.org/whl/rocm4.2/torch_stable.html",
                "CPU": "pip3 install torch==1.10.1+cpu torchvision==0.11.2+cpu torchaudio==0.10.1+cpu -f https://download.pytorch.org/whl/cpu/torch_stable.html"
            },
            "mac": {
                "CUDA_102": "# MacOS Binaries dont support CUDA, install from source if CUDA is needed <br> pip3 install torch torchvision torchaudio",
                "CUDA_113": "# MacOS Binaries dont support CUDA, install from source if CUDA is needed <br> pip3 install torch torchvision torchaudio",
                "ROCM_4": "<b>NOTE</b>: ROCm is not available on MacOS",
                "CPU": "pip3 install torch torchvision torchaudio"
            },
            "windows": {
                "CUDA_102": "pip3 install torch==1.10.1+cu102 torchvision==0.11.2+cu102 torchaudio===0.10.1+cu102 -f https://download.pytorch.org/whl/cu102/torch_stable.html",
                "CUDA_113": "pip3 install torch==1.10.1+cu113 torchvision==0.11.2+cu113 torchaudio===0.10.1+cu113 -f https://download.pytorch.org/whl/cu113/torch_stable.html",
                "ROCM_4": "<b>NOTE</b>: ROCm is not available on Windows",
                "CPU": "pip3 install torch torchvision torchaudio"
            }
        }

        let productionMapping = {
            "linux": {
                "CUDA_102": "pip3 install torch==1.8.2+cu102 torchvision==0.9.2+cu102 torchaudio==0.8.2 -f https://download.pytorch.org/whl/lts/1.8/torch_lts.html",
                "CUDA_113": "pip3 install torch==1.8.2+cu111 torchvision==0.9.2+cu111 torchaudio==0.8.2 -f https://download.pytorch.org/whl/lts/1.8/torch_lts.html",
                "ROCM_4": "<b>NOTE</b>: ROCm is not supported in LTS",
                "CPU": "pip3 install torch==1.8.2+cpu torchvision==0.9.2+cpu torchaudio==0.8.2 -f https://download.pytorch.org/whl/lts/1.8/torch_lts.html"
            },
            "mac": {
                "CUDA_102": "# macOS is not currently supported for lts",
                "CUDA_113": "# macOS is not currently supported for lts",
                "ROCM_4": "# macOS is not currently supported for lts",
                "CPU": "# macOS is not currently supported for lts"
            },
            "windows": {
                "CUDA_102": "pip3 install torch==1.8.2+cu102 torchvision==0.9.2+cu102 torchaudio===0.8.2 -f https://download.pytorch.org/whl/lts/1.8/torch_lts.html",
                "CUDA_113": "pip3 install torch==1.8.2+cu111 torchvision==0.9.2+cu111 torchaudio===0.8.2 -f https://download.pytorch.org/whl/lts/1.8/torch_lts.html",
                "ROCM_4": "<b>NOTE</b>: ROCm is not supported in LTS",
                "CPU": "pip3 install torch==1.8.2+cpu torchvision==0.9.2+cpu torchaudio===0.8.2 -f https://download.pytorch.org/whl/lts/1.8/torch_lts.html"
            }
        }

        let nightlyMapping = {
            "linux": {
                "CUDA_102": "pip3 install --pre torch torchvision torchaudio -f https://download.pytorch.org/whl/nightly/cu102/torch_nightly.html",
                "CUDA_113": "pip3 install --pre torch torchvision torchaudio -f https://download.pytorch.org/whl/nightly/cu113/torch_nightly.html",
                "ROCM_4": "pip3 install --pre torch torchvision -f https://download.pytorch.org/whl/nightly/rocm4.3.1/torch_nightly.html",
                "CPU": "pip3 install --pre torch torchvision torchaudio -f https://download.pytorch.org/whl/nightly/cpu/torch_nightly.html"
            },
            "mac": {
                "CUDA_102": "On MacOS, we provide CPU-only packages, CUDA functionality is not provided",
                "CUDA_113": "On MacOS, we provide CPU-only packages, CUDA functionality is not provided",
                "ROCM_4": "On MacOS, we provide CPU-only packages, CUDA functionality is not provided",
                "CPU": "pip3 install --pre torch torchvision torchaudio -f https://download.pytorch.org/whl/nightly/cpu/torch_nightly.html"
            },
            "windows": {
                "CUDA_102": "pip3 install --pre torch torchvision torchaudio -f https://download.pytorch.org/whl/nightly/cu102/torch_nightly.html",
                "CUDA_113": "pip3 install --pre torch torchvision torchaudio -f https://download.pytorch.org/whl/nightly/cu113/torch_nightly.html",
                "ROCM_4": "<b>NOTE</b>: ROCm is not supported in Windows",
                "CPU": "pip3 install --pre torch torchvision torchaudio -f https://download.pytorch.org/whl/nightly/cpu/torch_nightly.html"
            }
        }
        switch(user) {
            case "research":
                return researcherMapping[os][compute];
            case "production":
                return productionMapping[os][compute];
            case "nightly":
                return nightlyMapping[os][compute];
        }
    }

    function generateLibTorchString(type, dict) {
        return "LibTorch has not been implemented yet"
    }

    // Generate instructions for research or production
    $('.item').click(function() {
        var q1;
        $('.q1').each(function() {
            var cl = $(this).attr('class');
            if(cl.includes("selected")) {
                q1 = $(this).attr('id');
            }
        })

        var dict;
        var targetQuestionItemlist;
        var type;
        var package;
        if(q1 == "other") {
            dict = {
                ".q1": q1,
                ".q2-o": "",
                '.q3-o': "",
                '.q4-o': "",
                '.q5-o': "",
            }
            targetQuestionItemlist = oQuestionItemList;
            type = "o";
            package = ".q5-o";
        } else {
            dict = {
                ".q1": q1,
                ".q2-rp": "",
                '.q3-rp': "",
                '.q4-rp': "",
            }
            targetQuestionItemlist = rpQuestionItemList;
            type = "rp";
            package = ".q4-rp";
        }

        for(let i in targetQuestionItemlist) {
            let q = targetQuestionItemlist[i];
            $(q).each(function() {
                var cl = $(this).attr('class');
                if(cl.includes("selected")) {
                    dict[q] = $(this).attr('id');
                }
            })
        }

        var outString;
        switch(dict[package]) {
            case "source":
                outString = "# Follow instructions at this URL: https://github.com/pytorch/pytorch#from-source"
                break
            case "conda":
                outString = generateCondaString(type, dict);
                break
            case "pip":
                outString = generatePipString(type, dict);
                break
            case "libtorch":
                outString = generateLibTorchString(type, dict);
                break
            default:
                outString = "Not implemented yet"
        }
        $(".output-content").html(outString);    
    })

    $('.find-another-package-button').click(function() {
        $('.item').each(function(idx, obj) {
            $(obj).removeClass('selected');
        });
        
        $('.question3').each(function(idx, obj) {
            $(obj).addClass('hidden');
        });
        $('.question4').each(function(idx, obj) {
            $(obj).addClass('hidden');
        });
        $('.question5').each(function(idx, obj) {
            $(obj).addClass('hidden');
        });

        $('.output').addClass('hidden');
        $('.others').addClass('hidden');
        $('.research_or_production').addClass('hidden');
    })
});

