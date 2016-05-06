var childWindow;
function toQzoneLogin() {
    childWindow = window.open("/signin.html?act=qq_login", "TencentLogin", "width=500,height=400,menubar=0,scrollbars=1, resizable=1,status=1,titlebar=0,toolbar=0,location=1");
}
function closeChildWindow() {
    childWindow.close();
}

function code(obj) {
    var ran = Math.random();
    obj.src = '/include/code/getimg.php?' + ran;
}

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return decodeURI(arr[2]);
    else
        return null;
}

function getime(mtime, act, act1, obj) {
    if (mtime > 0) {
        obj.addClass("disabled").text(mtime + "秒后可重新获取");
    } else {
        obj.removeClass("disabled").text("获取验证码");
        obj.bind("click", function () {
            getcode(this, act, act1);
        });
    }
}
function getcode(obj, type, act, u) {
    if (type == "get" || type == "set") {
        var submit = $("#submitmobile");
    } else {
        var submit = $("#submitemail");
    }
    if (u == 1) {
        url = '/?do=forgetpassword&to=' + type;
    } else {
        url = '/?do=account&act=' + act + '&to=' + type;
    }
    loading(true);
    $.post(url, submit.serializeArray(), function (data) {
        if (data == "ok") {
            window.location.href = submit.find("[name='refer']").val();
        } else if (data > 0) {
            if (type == "get") {
                mcode = $("#mcode");
            } else {
                mcode = $("#emcode");
            }
            mcode.attr("onclick", "").unbind();
            var mtime = parseInt(data);
            getime(mtime, type, act, mcode);
            var timer1 = setInterval(function () {
                mtime = mtime - 1;
                getime(mtime, type, act, mcode);
                if (mtime <= 0) clearInterval(timer1);
            }, 1000);
        } else if (data) {
            if (type == "get") {
                $("#phoneno").forme6tip(data, 1);
            } else if (type == "set") {
                $("#codeno").forme6tip(data, 1);
            } else if (type == "eget") {
                $("#emailno").forme6tip(data, 1);
            } else if (type == "eset") {
                $("#ecodeno").forme6tip(data, 1);
            }
        }
        loading(false);
    });
}

function testdata(obj, doname) {
    loading(true);
    $.ajax({
        url: '/getdata.php?do=' + doname,
        type: 'POST',
        data: {"name": $(obj).val()},
        async: false,
        cache: false,
        success: function (data) {
            if (data) {
                $(obj).addClass("form-input-error").forme6tip(data, 1);
                Return = false;
            } else {
                $(obj).removeClass("form-input-error");
                Return = true;
            }
            loading(false);
        }
    });
    return Return;
}

function openconfirm(name, name1, callback, setwidth, font) {
    if (!font) font = 3;
    if (!setwidth) setwidth = 420;
    if ($("#modal-dialog").length == 0) $("body").append('<div id="modal-dialog" class="modal"></div>');
    $self = $("#modal-dialog");
    $self.width(setwidth).html('<div class="modal-tips-safebox"><div class="safe-icon-box"><i class="icon icon-fore' + font + '"></i><div class="fore">' +
        '<h3 class="font' + font + '" id="oconfirm">' + name + '</h3>' +
        '<p>' + name1 + '</p>' +
        '<a class="btn btn-primary btn-small" href="###">确定</a>' +
        '<a class="btn btn-small close" href="###">取消</a>' +
        '</div></div></div>').dialog({title: "提示", modal: true}).find(".btn-primary").click(function () {
        if (callback) callback($self);
    });
}

function cashsubmit(obj, str) {
    if (formtest(obj, 1)) {
        var money = parseFloat($("#moneyoff").val());
        var epoint = parseFloat($("#epointoff").val());
        var totalcash = money + (epoint * sepoint);
        if (str == 1) {
            if (totalcash < 5) {
                $("#totalcash").forme6tip('提款金额小于 5 元！', 1, "", 3);
                return false;
            }
        }
        loading(true);
        $.post('/?do=account&to=confirm&c=' + str, $("#formcash").serializeArray(), function (data) {
            dataarr = data.split("|~|");
            if (dataarr.length == 2) {
                $("#cash1 [name='paypass']").forme6tip(dataarr[1], 1, "", 3);
            } else {
                $("#modal-dialog").html(data).width(400).dialog({
                    title: "确认信息",
                    zIndex: 5050,
                    modal: false
                }).addClass("modal-bodered");
            }
            loading(false);
            data = null;
        });
    }
}

function savecash(obj, str) {
    loading(true);
    $.post('/?do=account&to=cash&c=' + str, $("#formcash").serializeArray(), function (data) {
        if (data == '') {
            if (str == 2) {
                $("#modal-tips-savecash").show();
                $("#modal-dialog").find(".modal-cashinfo").hide();
                getcash();
            } else {
                $("#modal-tips-drawcash").show();
                $("#modal-dialog").find(".modal-cashinfo").hide();
                $("#bank-dialog").dialog("close");
                $("#modal-cover").show();
            }
        } else {
            $("#casherr").text(data);
        }
        loading(false);
        data = null;
    });
}

function getcash() {
    loading(true);
    $.get('/?do=account&to=cash&n=' + Math.random(),
        function (data) {
            $("#bank-dialog").html(data).width(900).e6tip().dialog({
                title: "请填写提现信息",
                modal: true
            }, function (data) {
                $("#modal-dialog").hide();
            }).find("#epointoff").blur(function (data) {
                var money = parseFloat($("#moneyoff").val());
                var epoint = parseFloat(inputbox(this, 2));
                var poundage = epoint - (epoint * sepoint);
                var totalcash = money + (epoint * sepoint);
                $("#poundage").text(poundage.toFixed(2));
                $("#totalcash").text(totalcash.toFixed(2));
            });
            $("#moneyoff").blur(function (data) {
                var money = parseFloat(inputbox(this, 2));
                var epoint = parseFloat($("#epointoff").val());
                var poundage = epoint - (epoint * sepoint);
                var totalcash = money + (epoint * sepoint);
                $("#poundage").text(poundage.toFixed(2));
                $("#totalcash").text(totalcash.toFixed(2));
            });
            loading(false);
            data = null;
        }
    )
    ;
}
function round(v, e) {
    var t = 1;
    for (; e > 0; t *= 10, e--);
    for (; e < 0; t /= 10, e++);
    return Math.round(v * t) / t;
}
var money = 0;
function setmoney(type, use, t) {
    var yong = 0;
    if (t != 1) money = parseFloat(remaining);
    var price = parseFloat($("#moneyset").attr("m"));    //余额可用
    var point = parseFloat($("#epointset").attr("m"));   //E卡可用
    if (type == 1) {
        if (use == 1) {
            if (price > money) {
                yong = money;
            } else {
                yong = price;
            }
            money -= yong;
        } else {
            yong = 0;
        }
        $("#money1").text(yong.toFixed(2));
        $("[name='money']").val(yong.toFixed(2));
        if (money > 0) {
            if (t != 1 && $("#epointset").find(".selected").index() == 1) {
                setmoney(2, 1, 1);
            }
        } else if (t != 1) {
            $("#money2").text(0);
            $("[name='epoint']").val(0);
            $("#ediscount").hide();
        }
        $("#money3").text(money.toFixed(2));
        if (money != remaining) {
            $("#payment-paypass").show();
        } else {
            $("#payment-paypass").hide();
        }
    } else if (type == 2) {
        if (use == 1) {
            if (point > money) {
                yong = money;
            } else {
                yong = point;
            }
            if (yong > epoint) {
                yong = epoint;
            }
            money -= yong;
        } else {
            yong = 0;
        }
        if (yong > 0) {
            var yh = 0;
            var yong1 = yong;
            if (yong > 0) {
                $.each(elist, function (a, b) {
                    if (yong1 >= b[0]) {
                        yh += parseFloat(b[1]);
                        yong1 = round(yong1 - parseFloat(b[0]), 2);
                    }
                });
            }
            if (yh > 0) {
                $("#ediscount").show().find("span").text(round(yong - yh, 2));
            } else {
                $("#ediscount").hide();
            }
        }
        $("#money2").text(yong);
        $("[name='epoint']").val(yong);
        if (money > 0) {
            if (t != 1 && $("#moneyset").find(".selected").index() == 1) {
                setmoney(1, 1, 1);
            }
        } else if (t != 1) {
            $("#money1").text(0);
            $("[name='money']").val(0);
        }
        $("#money3").text(money.toFixed(2));
        if (money != remaining) {
            $("#payment-paypass").show();
        } else {
            $("#payment-paypass").hide();
        }
    }
}

function getgift(type, id) {
    if (type == 3) {
        loading(true);
        $.post('/?do=account&act=codedetail&to=confirm', $("#gift1").serializeArray(), function (data) {
            dataarr = data.split("|~|");
            if (dataarr.length == 2) {
                $("#gift1 [name='paypass']").forme6tip(dataarr[1], 1, "", 3);
            } else if (data == "ok") {
                window.location.reload();
            } else {
                $("#modal-dialog").dialog("title", "发送兑换券给朋友/领导/家人").dialog('content', data);
            }
            loading(false);
            data = null;
        });
    } else if (type == 4) {
        if (formtest(id, 1)) {
            if ($("#receive1").val() != $("#receive2").val()) {
                $("#receive2").addClass("form-input-error").forme6tip($("#receive2").attr("err"), 1);
            } else {
                $("#receive2").removeClass("form-input-error");
                loading(true);
                $.post('/?do=account&act=codedetail&to=giftsend', $("#gift2").serializeArray(), function (data) {
                    if (data == "ok") {
                        openconfirm("", '礼品网兑换卷已发送给您的好友！', function (obj) {
                            obj.dialog("close");
                        });
                    } else {
                        $("#gift2-error").html(data).show();
                    }
                    loading(false);
                    data = null;
                });
            }
        }
    } else {
        loading(true);
        $.get('/?do=account&act=codedetail&to=paypass&type=' + type + '&key=' + encodeURIComponent(id), function (data) {
            $("#modal-dialog").html(data).width(380).dialog({
                title: "请输入支付密码",
                modal: true
            });
            loading(false);
            data = null;
        });
    }
}

function submitpay(obj, str) {
    if ($("#payment-paypass").is(":hidden")) {
        $("#payment-paypass [type='password']").removeAttr("null");
    } else {
        $("#payment-paypass [type='password']").attr("null", '请填写支付密码');
    }
    ;
    if (formtest(obj, 1)) {
        jQuery.ajax({
            type: "POST",
            async: false,
            url: $("#" + $(obj).attr("name")).attr("action"),
            data: $("#" + $(obj).attr("name")).serializeArray(),
            cache: false,
            success: function (data) {
                dataarr = data.split("|~|");
                if (dataarr.length == 2) {
                    $("[name='paypass']").forme6tip(dataarr[1], 1, "", 3);
                } else if (dataarr.length == 3) {
                    $("#modal-dialog").html(dataarr[2]).width(550).dialog({
                        title: "请完成付款",
                        modal: true
                    }).addClass("modal-bodered");
                    var url = dataarr[0];
                    if (url == "ok") {
                        window.location.reload();
                    } else {
                        window.open(url);
                        $("#newhref").attr("href", url);
                        //触发支付完成检查
                        var timer1 = setInterval(function () {
                            jQuery.ajax({
                                type: "get",
                                async: false,
                                url: '/?do=payment&act=payCheck&order=' + dataarr[1],
                                cache: false,
                                success: function (data) {
                                    if (data == "ok") {
                                        window.location.reload();
                                        clearInterval(timer1);
                                    }
                                }
                            });
                        }, 5000);
                        $("#modal-dialog").find(".close").click(function () {
                            clearInterval(timer1);
                        });
                    }
                } else {
                    alert(data);
                }
                data = null;
            }
        });
    }
}

function setbanktype(obj, str, zh) {
    $("#banktype-group li").removeClass("selected");
    if (str == 1) {
        $("[name='account']").attr("reg", "^[0-9]{5,20}$").attr("err", "银行卡格式不正确！");
        $("#tobanka").show();
    } else {
        $("[name='account']").attr("reg", "^[A-Za-z0-9@._-~]{5,50}$").attr("err", "帐号格式不正确！");
        $("#tobanka").hide();
    }
    $(obj).addClass("selected");
    var bname = $(obj).text();
    $("#banktype").val(str);
    $("[name='account']").val(zh);
    $("#banktypename").text(bname);
}

function setgivetype(obj, str) {
    $("#give-group li").removeClass("selected");
    $(obj).addClass("selected");
    if (str == 1) {
        $("#receive1").attr("reg", "^[A-Za-z0-9._]*@([A-Za-zd]+[-_.])+[A-Za-zd]{2,5}$").attr("err", "邮箱格式不正确！");
        $("#receive2").attr("err", "两次邮箱输入不一致！");
        $("#givetypename, #givetypename2").text("邮箱");
    } else {
        $("#receive1").attr("reg", "^[0-9]{6,15}$").attr("err", "手机号格式不正确！");
        $("#receive2").attr("err", "两次手机号输入不一致！");
        $("#givetypename, #givetypename2").text("手机");
    }
    $("#gift2 [name='send']").val(str);
}

function setaddress(obj, type, id) {
    if (type == "del") {
        openconfirm("是否删除收货地址？", '', function (obj) {
            loading(true);
            $.post('/?do=account&act=address&to=' + type, "id=" + id, function (data) {
                dataarr = data.split("||");
                if (dataarr[0] == "删除成功") {
                    $("#mailing_" + dataarr[1]).fadeOut(function () {
                        $(this).remove();
                    });
                }
                if ($(".address-item").length == 0) {
                    $(".box-nodata").show();
                }
                obj.dialog("close");
                loading(false);
                data = null;
            });
        });
        return false;
    }
    loading(true);
    $("#modal-dialog").hide();
    $.post('/?do=account&act=address&to=' + type, "id=" + id, function (data) {
        dataarr = data.split("||");
        if (dataarr == "ok") {
            $(".btn-address").removeClass("disabled").text("设为默认地址");
            $(obj).addClass("disabled").text("默认地址");
        } else if (dataarr[0] == "读取成功") {
            $("#modal-dialog").width(710).html(dataarr[4]);
            loadCity(dataarr[1], dataarr[2], dataarr[3]);
            $("#modal-dialog").dialog({title: "修改收货地址", modal: false}, function (data) {
                $("#eytip").hide();
            });
        } else if (dataarr[0] == "添加新地址") {
            $("#modal-dialog").width(710).html(dataarr[1]).dialog({title: "添加新收货地址", modal: false}, function (data) {
                $("#eytip").hide();
            });
        } else if (dataarr[0] == "删除成功") {
            $("#mailing_" + dataarr[1]).fadeOut(function () {
                $(this).remove();
            });
        }
        loading(false);
        data = null;
    });
};
function loadCity(city, county, town) {
    var provinceId = $("#provinceDiv option:selected").index();
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "/getdata.php?do=address",
        data: "provinceId=" + provinceId,
        cache: false,
        success: function (dataResult) {
            if (dataResult) {
                var provinceHtml = "<option value=\"\">请选择</option>";
                for (var key in dataResult) {
                    if (city == dataResult[key]) {
                        provinceHtml += "<option value='" + dataResult[key] + "' selected=\"selected\">" + dataResult[key] + "</option>";
                    } else {
                        provinceHtml += "<option value='" + dataResult[key] + "'>" + dataResult[key] + "</option>";
                    }
                }
            }
            $("#cityDiv").html(provinceHtml);
            $("#countyDiv").html("<option value=\"\">请选择</option>");
            $("#TownDiv").html("<option value=\"\">请选择</option>").hide();
            if (!isUndefined(city)) loadCounty(city, county, town);
        }
    });
};
function loadCounty(city, county, town) {
    var provinceId = $("#provinceDiv option:selected").index();
    var CityId = $("#cityDiv option:selected").index();
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "/getdata.php?do=address",
        data: "provinceId=" + provinceId + "&CityId=" + CityId,
        cache: false,
        success: function (dataResult) {
            if (dataResult) {
                var CityHtml = "<option value=\"\">请选择</option>";
                for (var key in dataResult) {
                    if (county == dataResult[key]) {
                        CityHtml += "<option value='" + dataResult[key] + "' selected=\"selected\">" + dataResult[key] + "</option>";
                    } else {
                        CityHtml += "<option value='" + dataResult[key] + "'>" + dataResult[key] + "</option>";
                    }
                }
            }
            $("#countyDiv").html(CityHtml);
            $("#TownDiv").html("<option value=\"\">请选择</option>");
            if (!isUndefined(county)) loadTown(city, county, town);
        }
    });
};
function loadTown(city, county, town) {
    var provinceId = $("#provinceDiv option:selected").index();
    var CityId = $("#cityDiv option:selected").index();
    var countyId = $("#countyDiv option:selected").index();
    jQuery.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "/getdata.php?do=address",
        data: "provinceId=" + provinceId + "&CityId=" + CityId + "&countyid=" + countyId,
        cache: false,
        success: function (dataResult) {
            if (dataResult.length == 0) {
                $("#TownDiv").hide();
            } else {
                var TownHtml = "<option value=\"\">请选择</option>";
                for (var key in dataResult) {
                    if (town == dataResult[key]) {
                        TownHtml += "<option value='" + dataResult[key] + "' selected=\"selected\">" + dataResult[key] + "</option>";
                    } else {
                        TownHtml += "<option value='" + dataResult[key] + "'>" + dataResult[key] + "</option>";
                    }
                }
                $("#TownDiv").html(TownHtml).show();
            }
        }
    });
};

function setspecial(obj, str1) {
    var specialname = $("#special").val();
    if ($(obj).hasClass("selected")) {
        $(obj).removeClass("selected");
        $("#special").val(specialname.replace(str1 + ",", ""));
    } else {
        $(obj).addClass("selected");
        $("#special").val(specialname + str1 + ",");
    }
};

function getcard(obj, str1, id) {
    if (str1 == 3 || str1 == 4) {
        if (formtest(obj, 1)) {
            $.post('/?do=account&act=giftcard&to=' + str1 + '&id=' + id, $("#formcash").serializeArray(), function (data) {
                dataarr = data.split("|~|");
                if (dataarr.length == 2) {
                    $("#formcash [name='paypass']").forme6tip(dataarr[1], 1, "", 3);
                } else {
                    $("#modal-dialog").dialog("title", "成功").width(400).dialog('content', data);
                }
                data = null;
            });
        }
    } else {
        $.get('/?do=account&act=giftcard&to=' + str1 + '&id=' + id, function (data) {
            $("#modal-dialog").html(data).width(400).dialog({
                title: "提示信息",
                modal: true
            });
            $("#cardnum").blur(function (data) {
                var cardid = parseFloat(inputbox(this));
                if (str1 == 2) {
                    var saleprice = parseFloat($("#saleprice").text()) * cardid;
                    $("#priceid").text(saleprice.toFixed(2));
                }
            }).blur();
        });
    }
}

var cardnum = cardid = reuser = 1;
var carddata = cardl = '';
function loadingcard(recover) {
    jQuery.ajax({
        type: "GET",
        dataType: "json",
        async: false,
        url: "/getdata.php?do=getcardrecover",
        cache: false,
        success: function (data) {
            $("#card-dialog").dialog({hide: true, modal: true});
            carddata = data;
            reuser = recover;
            cardl = '<select class="form-select" name="cardtype[]" onchange="ctselect(this)">';
            $.each(data, function (a) {
                cardl = cardl + '<option value="' + a + '">' + data[a]["name"] + '</option>';
            });
            cardl = cardl + '</select>';
            // 第一个卡表单加载
            $("#cardtype").after(cardl).remove();
            ctselect($("[name='cardtype[]'] option:first"));
            $("#cnum").text(1);
            zprice();
            $("#sell-addcard").click(function () {
                addcard(2, 0, "", "");
            });
            $("#setcardlist").click(function () {
                var taglist = $("#cardid").val();
                taglist = taglist.split("\n");
                $.each(taglist, function (a, b) {
                    card = b.split(/\s{1,}/);
                    if (card.length > 1) {
                        addcard(ctid, cpid, $.trim(card[0]), $.trim(card[1]));
                    } else {
                        addcard(ctid, cpid, $.trim(card[0]), '');
                    }
                });
                $("#cardid").val('');
                $("#card-dialog").dialog("close");
                zprice();
            });
        }
    });
};

function delc(id) {
    $("#c_" + id).fadeOut(function () {
        $(this).remove();
        zprice();
        cardnum -= 1;
        $("#cnum").text(cardnum);
        if (cardnum < 2) {
            $("#nosellcard").fadeIn();
            $(".del-sellcard").hide();
            $(".sell-group li:not(.nocard-tips)").addClass("card-stress");
        }
    });
};

function zprice() {
    var zprice = 0;
    $("#card_list .cardprice").each(function () {
        zprice += parseFloat($(this).text());
    });
    $("#zprice").text(zprice.toFixed(2));
};

function ctselect(obj) {
    var parent = $(obj).closest("li");
    var value = $(obj).val();
    var cpobj = parent.find("select[name='cardprice[]']").empty();
    var html = '';
    $.each(carddata[value]["list"], function (a, b) {
        if (b["price"] == 0) {
            html = html + '<option value="' + b["id"] + '|0" cid="' + b["id"] + '" price="' + b["rprice"] + '">自定义面值</option>';
        } else if (b["ltype"] > reuser) {
            html = html + '<option value="' + b["id"] + '">&yen;' + b["price"] + ' 限制</option>';
        } else {
            html = html + '<option value="' + b["id"] + '">&yen;' + b["price"] + '</option>';
        }
    });
    cpobj.html(html);
    parent.find(".cardprice").text(carddata[value]["list"][0]["rprice"]);
    zprice();
};

function diyselect() {
    var cardprice = parseInt($("#carddiy").find("input").val());
    var cid = $("#carddiy").attr("cid");
    var index = $("#carddiy").attr("index");
    if (cid > 0 && index > 0) {
        var obj = $("#c_" + cid).find("select[name='cardprice[]'] option:eq(" + index + ")");
        obj.val(obj.attr("cid") + "|" + cardprice).text("自定义面值(" + cardprice + ")");
        $("#c_" + cid).find(".cardprice").text(round(cardprice * carddata[$("#carddiy").attr("val")]["list"][index]["rprice"], 2));
        $("#carddiy").hide();
        zprice();
    }
};

var ctid = cpid = 0;
function opencade(obj, cardid) {
    var obj = $("#c_" + cardid);
    ctid = obj.find("select[name='cardtype[]']").val();
    cpid = obj.find("select[name='cardprice[]']").find("option:selected").index();
    var name = carddata[ctid]["name"] + " - " + carddata[ctid]["list"][cpid]["price"];
    $("#cardts").text(name);
    $("#card-dialog").dialog("title", name).show();
    $("#modal-cover").show();
};

function submitcard(obj, submit, num) {
    if (formtest(obj, 1)) {
        loading(true);
        $.post('/?do=account&act=sell&ajax=1&submit=' + submit, $("#sell").serializeArray(), function (data) {
            loading(false);
            if (data["state"] == 0) {
                openconfirm(data["err"], '', function (obj) {
                    obj.dialog("close");
                }, 400, 2);
            } else if (data["state"] == 2) {
                if (num > 0) {
                    html = '';
                    for (x = 1; x <= (num + 1); x++) {
                        html += '<li id="c_' + x + '"></li>';
                    }
                    $("#card-tips").html(html);
                }
                openconfirm(data["err"], '【确定】强制提交【取消】返回修改', function (obj) {
                    submitcard(obj, 1);
                }, 430, 3);
                if (num > 0) {
                    $.each(data["list"], function (a, b) {
                        $("#c_" + a).text(b);
                    });
                } else {
                    $.each(data["list"], function (a, b) {
                        $("#" + a).addClass("card-error").removeClass('card-edit').find(".stress").text(b);
                    });
                    $("#card_list li.card-error").click(function () {
                        $(this).removeClass('card-error').addClass("card-edit");
                    });
                }
            } else if (data["state"] == 1) {
                openconfirm(data["tip"], '我们将尽快处理您的卡劵，请等待……', function (obj) {
                    window.location.reload();
                }, 430, 1);
            }
            data = null;
        }, 'json');
    }
};

function addcard(id1, id2, card, pass) {
    cardid += 1;
    var card_list = $("#card_list");
    var html = '<li id="c_' + cardid + '">' + cardl + '<select class="form-select" name="cardprice[]" cid="' + cardid + '" onchange="cpselect(this)">';
    $.each(carddata[id1]["list"], function (a, b) {
        if (b["price"] == 0) {
            html = html + '<option value="' + b["id"] + '|0" cid="' + b["id"] + '" price="' + b["rprice"] + '">自定义面值</option>';
        } else if (b["ltype"] > reuser) {
            html = html + '<option value="' + b["id"] + '">&yen;' + b["price"] + ' 限制</option>';
        } else if (id2 == a) {
            html = html + '<option value="' + b["id"] + '" selected>&yen;' + b["price"] + '</option>';
        } else {
            html = html + '<option value="' + b["id"] + '">&yen;' + b["price"] + '</option>';
        }
    });
    html += '</select><input type="hidden" name="subid[]" value="c_' + cardid + '" /><input class="form-input" name="cardid[]" type="text" placeholder="卡号：" value="' + card + '" />';
    html += '<input class="form-input" name="cardpsw[]" type="text" placeholder="卡密：" value="' + pass + '" reg="^[A-Za-z0-9_-]{4,30}$" null="必须输入卡密" />';
    html += '<a class="btn btn-small" href="javascript:;" onclick="opencade(this,' + cardid + ')">批量添加此类卡</a>';
    html += '<p class="form-text"><a class="modal-close del-sellcard fn-hide" href="javascript:;" onclick="delc(' + cardid + ')">删除</a>';
    html += '<span class="yjdz">预计到帐<strong><span class="yen">&yen;</span><em class="cardprice">' + carddata[id1]["list"][id2]["rprice"] + '</em></strong></span><strong class="stress ybtj"></strong></p>';
    card_list.append(html);
    $("#c_" + cardid + " [name='cardtype[]']").val(id1);
    cardnum += 1;
    $("#cnum").text(cardnum);
    zprice();
    getcolor();
    fixedfloat();
    $("#nosellcard").hide();
    $(".del-sellcard").show();
    $(".sell-group li").removeClass("card-stress");
};

function cardadd(id, id1, card, pass) {
    var card_list = $("#card_list");
    var html = '<li class="form-item fn-clear" id="c_' + cardid + '"><label class="form-label">卡号：</label>'
    html += '<input type="hidden" name="subid[]" value="c_' + cardid + '"/>';
    html += '<input type="hidden" name="cardtype[]" value="' + id + '" /><input class="form-input kh" name="cardid[]" type="text" value="' + card + '">';
    html += '<label class="form-label">密码：</label>';
    html += '<input class="form-input km" name="cardpsw[]" type="text" value="' + pass + '" reg="^[A-Za-z0-9_-]{4,30}$" null="必须输入卡密">';
    html += '<select class="form-select" name="cardprice[]" cid="1" onchange="cpselect(this)">';
    $.each(carddata[id]["list"], function (a, b) {
        if (b["price"] == 0) {
            html = html + '<option value="' + b["id"] + '|0" cid="' + b["id"] + '" price="' + b["rprice"] + '">自定义面值</option>';
        } else if (b["ltype"] > recover) {
            html = html + '<option value="' + b["id"] + '">&yen;' + b["price"] + ' 限制</option>';
        } else if (id1 == a) {
            html = html + '<option value="' + b["id"] + '" selected>&yen;' + b["price"] + '</option>';
        } else {
            html = html + '<option value="' + b["id"] + '">&yen;' + b["price"] + '</option>';
        }
    });
    html += '</select>';
    html += '<p class="form-text">预计到帐：<span class="yjdz"><strong class="orange"><span class="yen">&yen;</span><em class="cardprice">' + carddata[id]["list"][id1]["rprice"] + '</em></span></strong><strong class="stress ybtj"></strong></p>';
    html += '<a class="modal-close del-junka" href="javascript:;" onclick="delc(' + cardid + ')">x</a></li>';
    card_list.append(html);
    $("#cnum").text(cardnum);
    zprice();
    cardnum += 1;
    cardid += 1;
};

function cpselect(obj) {
    var parent = $(obj).closest("li");
    var value = $(obj).find("option:selected");
    var cpobj = parent.find("[name='cardtype[]']");
    if (value.text().indexOf("定义面值") > 0) {
        $("#carddiy").attr("index", value.index()).attr("val", cpobj.val()).attr("cid", $(obj).attr("cid")).dialog({
            title: "请输入卡面值",
            modal: false
        }).show();
        return false;
    }
    if (value.text().indexOf("限制") > 0) {
        parent.find('.form-input').val('').attr("disabled", true);
        alert('售卡等级不足，请联系客服提升售卡等级！');
    } else {
        parent.find('.form-input').attr("disabled", false);
        parent.find(".cardprice").text(carddata[cpobj.val()]["list"][value.index()]["rprice"]);
        zprice();
    }
};

function getecard(type) {
    if (type == 1) {
        openconfirm("您确定要将此卡激活充值吗？", '礼品网E卡激活充值后，余额将会充入您的E卡余额中。激活充值之后此卡将作废！', function (obj) {
            $.post('/?do=account&act=ecard&to=1', $("#ecard").serializeArray(), function (data) {
                obj.dialog('content', data);
            });
        }, 500);
    } else {
        loading(true);
        $.post('/?do=account&act=ecard&to=2', $("#ecard").serializeArray(), function (data) {
            $("#modal-dialog").html(data).width(420).dialog({
                title: "提示！",
                modal: true
            });
            loading(false);
            data = null;
        });
    }
};

function passcode(type) {
    $.post('/?do=passcode&act=submit&ajax=1&type=' + type, $("#settlement").serializeArray(), function (data) {
        dataarr = data.split("||");
        if (dataarr[0] == "login") {
            $.get('/?do=signin&act=login&callback=passcode(' + type + ')', function (data) {
                $("#modal-dialog").html(data).width(360).dialog({
                    title: "存在自动发货商品，需要您登录！",
                    modal: true
                });
            });
        } else if (type == 1) {
            $("#settlement").submit();
        } else if (type == 2) {
            $("#modal-dialog").html(data).width(400).dialog({
                title: "回收成功",
                modal: true
            });
        }
        loading(false);
        data = null;
    });
};

function dialog(type, id) {
    var dialogtrue = true;
    if (type == 1) {
        dialogtrue = formtest($("#buysubmit"), 1);
        if (dialogtrue && $("[name='mobiletype']").val() == '') {
            dialogtrue = false;
            $("#btn-gobuy").forme6tip('手机号码未通过！');
        }
    }
    if (dialogtrue) {
        loading(true);
        $.post('/?do=p&id=' + id + "&type=" + type, $("#buysubmit").serializeArray(), function (data) {
            dataarr = data.split("||");
            if (dataarr[0] == "login") {
                $.get('/?do=signin&act=login&callback=dialog(' + type + ',' + id + ')', function (data) {
                    $("#modal-dialog").html(data).width(360).dialog({
                        title: "用户登录！",
                        modal: true
                    });
                });
            } else if (dataarr[0] == "ok") {
                if (type == 1) {
                    $("#buysubmit").submit();
                } else if (type == 2) {
                    $("#modal-dialog").html(dataarr[1]).width(420).dialog({
                        title: "提示",
                        modal: true,
                        timeout: 3
                    });
                } else if (type == 3) {
                    $("#modal-dialog").html(dataarr[1]).width(350).dialog({
                        title: "提示",
                        modal: true,
                        timeout: 3
                    });
                }
            }
            loading(false);
            data = null;
        });
    }
};

function hot(type, id, lid, sid) {
    loading(true);
    divedit = "#modal-dialog";
    $.post('/?do=p&id=' + id + "&type=" + type, {lid: lid, sid: sid, buynum: 1}, function (data) {
        dataarr = data.split("||");
        if (dataarr[0] == "login") {
            $.get('/?do=signin&act=login&callback=hot(' + type + ',' + id + ',' + lid + ',' + sid + ')', function (data) {
                $(divedit).html(data).width(360).dialog({
                    title: "用户登录！",
                    modal: true
                });
            });
        } else if (dataarr[0] == "ok") {
            if (type == 1) {
                $("#buysubmit").submit();
            } else if (type == 2) {
                $("#modal-dialog").html(dataarr[1]).width(420).dialog({
                    title: "提示",
                    modal: true
                });
            } else if (type == 3) {
                $("#modal-dialog").html(dataarr[1]).width(350).dialog({
                    title: "提示",
                    modal: true
                });
            }
        }
        loading(false);
        data = null;
    });
};

function cancel(id) {
    openconfirm("是否取消收藏？", '', function (obj) {
        $.post('/?do=account&act=favourite&to=del', "id=" + id, function (data) {
            if (data > 0) {
                $("#f_" + id).remove();
                obj.dialog("close");
            } else {
                obj.find('#oconfirm').html("取消收藏错误，请重试！");
            }
        });
    });
};

var accegmentdata = '';
function setphone(obj, type, name) {
    var mobile = $(obj).val();
    if (mobile.length == 11) {
        $.post('/?do=buycard&act=accegment', "mobile=" + mobile, function (data) {
            accegmentdata = data;
            if (type == 1) {
                var tobj = $("#con_phonepay_1");
                if (!data) {
                    tobj.find(".attr").html('<span style="color: red">号码不被识别</span>');
                } else {
                    tobj.find(".price").text(data["price"][0]["price"]);
                    tobj.find(".attr").text(data["attr"]);
                    var html = '';
                    $.each(data["price"], function (a, b) {
                        html = html + '<option value="' + a + '">' + b["price"] + '</option>';
                    });
                    tobj.find("[name='prodid']").html(html);
                    $("[name='tradid']").val(data["price"][0]["id"]);
                    $("[name='lid']").val(data["price"][0]["lid"]);
                }
            } else if (type == 3) {
                if (name != data["province"]) {
                    $("#phoneattr").html('<span style="color: red">手机号码不匹配</span>');
                } else {
                    $("#phoneattr").text(data["attr"]);
                    $("[name='mobiletype']").val(data["attr"]);
                }
            }
        }, 'json');
    }
};
function setpprice(obj, type) {
    if (accegmentdata) {
        var id = $(obj).val();
        $("#con_phonepay_" + type + " .price").text(accegmentdata["price"][id]["price"]);
        $("[name='tradid']").val(accegmentdata["price"][id]["id"]);
        $("[name='lid']").val(accegmentdata["price"][id]["lid"]);
    }
};

function pricesubmit(id) {
    var users = getCookie("wq_username");
    var dialogtrue = formtest($("#con_phonepay_" + id), 1);
    if (id == 1) {
        if (dialogtrue && $("[name='mobiletype']").val() == '') {
            dialogtrue = false;
            $("[name='con_phonepay_1']").forme6tip('手机号码未通过！', 1);
        }
    }
    if (dialogtrue && isUndefined(users)) {
        $.get('/?do=signin&act=login&callback=pricesubmit(' + id + ')', function (data) {
            $("#modal-dialog").html(data).width(360).dialog({
                title: "用户登录！",
                modal: true
            });
        });
        dialogtrue = false;
    }
    if (dialogtrue) {
        $("#con_phonepay_" + id).submit();
    }
};

// 详细页图片展示效果
function detailpreview() {
    var i = 0;
    curindex = 0,
        viewimg = $("#previewimg"),
        smallimg = $("#smallimgs img"),
        allsmall = smallimg.length,
        smallong = smallimg.width() + 14;
    totalong = allsmall * smallong,
        outwidth = $(".preview-thumb-inner").width();
    if (!$(".preview-thumb").hasClass("fn-hide")) {
        $(".preview-thumb").show();
    }
    smallimg.eq(0).addClass("selected");
    viewimg.attr("src", smallimg.eq(0).attr("src").replace(".thumb.jpg", ""));
    viewimg.attr("jqimg", smallimg.eq(0).attr("src").replace(".thumb.jpg", ""));
    $("#smallimgs").width(totalong);
    $(".preview-thumb").append("<a class='thumb-btn disabled' id='thumb-prev' href='javascript:;'></a><a class='thumb-btn' id='thumb-next' href='javascript:;'></a>");

    if (allsmall < 6) {
        $(".thumb-btn").addClass("disabled");
        $("#smallimgs").css("left", "0px");
    } else if (allsmall == 6) {
        $(".thumb-btn").hide();
        $(".preview-thumb-inner").css({
            width: "480px",
            marginLeft: "-2px"
        });
    } else {
        $("#smallimgs").css({
            position: "absolute",
            top: "0px",
            left: "0px"
        });
    }

    smallimg.mouseover(function () {
        curindex = $(this).index();
        viewimg.attr("src", $(this).attr("src").replace(".thumb.jpg", ""));
        viewimg.attr("jqimg", $(this).attr("src").replace(".thumb.jpg", ""));
        $(this).addClass("selected").siblings().removeClass("selected");
    });

    $(".thumb-btn").click(function () {
        var lefts = parseInt($("#smallimgs").css("left"));
        if (i == 0) {
            if ($(this).attr("id") == "thumb-prev") {

                if (lefts >= 0) {
                    if (!$(this).hasClass("disabled")) {
                        $(this).addClass("disabled");
                    }
                } else {
                    i = 1;
                    $("#thumb-next").removeClass("disabled");
                    $("#smallimgs").animate({left: lefts + smallong + "px"}, 200, function () {
                        i = 0;
                    });
                    if (lefts >= -smallong) {
                        if (!$(this).hasClass("disabled")) {
                            $(this).addClass("disabled");
                        }
                    }
                }
            } else {
                if (lefts <= -(totalong - outwidth)) {
                    if (!$(this).hasClass("disabled")) {
                        $(this).addClass("disabled");
                    }
                } else {
                    i = 1;
                    $("#thumb-prev").removeClass("disabled");
                    $("#smallimgs").animate({left: lefts - smallong + "px"}, 200, function () {
                        i = 0;
                    });
                    if (lefts <= -(totalong - outwidth - smallong)) {
                        if (!$(this).hasClass("disabled")) {
                            $(this).addClass("disabled");
                        }
                    }
                }
            }
        }
    });
};

function getRGB(min, max) {
    return {
        r: min + Math.round(Math.random() * 1000) % (max - min),
        g: min + Math.round(Math.random() * 1000) % (max - min),
        b: min + Math.round(Math.random() * 1000) % (max - min)
    };
}
function getcolor(opbj) {
    var cardborder = $("#c_" + cardid),
        color = {
            r: 0,
            g: 0,
            b: 0
        },
        min = 180,
        max = 720,
        minHex = parseInt('66', 16),
        maxHex = parseInt('DD', 16);

    while (true) {
        color = getRGB(minHex, maxHex);
        if ((color.r + color.g + color.b) >= min && (color.r + color.g + color.b) <= max) {
            break;
        }
    }
    bcolor = 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
    cardborder.css("border-top-color", bcolor);
}

function fixedfloat() {
    if ($("#side-float").length) {
        $("#side-float").smartFloat({
            classname: 'side-float-fixed',
            reference: $(".footer").offset().top - 166
        });
    }
}


$(function () {
    $("body").e6tip();
    var users = getCookie("wq_username");
    if (users) {
        $(".username").text(users);
        $(".userstate1").hide();
        $(".userstate2").show();
    }
	// ifold
    $(".ifold-menu a").click(function () {
        var obj = $(this).closest(".ifold");
        if (obj.hasClass("iunfold")) {
            obj.removeClass("iunfold");
        } else {
            obj.addClass("iunfold");
			obj.siblings().removeClass("iunfold");
        }
    });
    // autocomplete
    $("#searchkeywords").autocomplete('/getdata.php?do=autocomplete', {
        minChars: 2,
        useDelimiter: true,
        selectFirst: false,
        autoFill: false,
        remoteDataType: 'json',
        sortResults: false,
        filterResults: false,
        onItemSelect: function (data) {
            window.location = data['data'];
        }
    });
    $("#search-shop").click(function () {
        var type = $(".searchall select").val();
        var url = "/shop.html";
        location.href = url + '?searchkey=' + encodeURIComponent($(".search-input").val());
    });

    // switch-group > li
    $(".switch-group > li").click(function () {
        if (!$(this).hasClass("selected")) {
            $(this).addClass("selected").siblings().removeClass("selected");
        }
    }).hover(function () {
        $(this).addClass("hover");
    }, function () {
        $(this).removeClass("hover");
    });

    // payment-choose li
    $("#payment-choose > li").click(function () {
        if ($(this).attr("id") == "ebank") {
            $(".payment-item").hide();
            $("#payment-ebank").show();
            $("#paytype").val(1);
        } else if ($(this).attr("id") == "credit") {
            $(".payment-item").hide();
            $("#payment-credit").show();
            $("#paytype").val(3);
        } else {
            $(".payment-item").hide();
            $("#payment-platform").show();
            $("#paytype").val(2);
        }
    });

    // btn-showpass
    $(".btn-showpass").click(function () {
        var prt = $(this).parents(".drawcard-item");
        if (prt.hasClass("drawcard-show")) {
            $(this).html("展开卡密");
            prt.removeClass("drawcard-show");
        } else {
            $(this).html("折叠卡密");
            prt.addClass("drawcard-show");
        }
    });

    // btn-passcode
    $(".btn-passcode").click(function () {
        if ($("#orderinfo-passcode").is(":hidden")) {
            $(this).html("返回收货地址").removeClass("btn-primary");
            $("#orderinfo-passcode").show();
            $("#orderinfo-address").hide();
            $(".orderinfo-item-flip").addClass("flip180");
            $('[name="shoptype"]').val(1);
        } else {
            $(this).html("生成礼品网兑换券").addClass("btn-primary");
            $("#orderinfo-passcode").hide().removeClass("flip180");
            ;
            $("#orderinfo-address").show();
            $(".orderinfo-item-flip").removeClass("flip180");
            $('[name="shoptype"]').val(0);
            $("#giftnum").val(1).change();
        }
    });

    function minusclick(bid) {
        if (bid) {
            var quants = $(bid).find(".col-quant"),
                prices = quants.prev(".col-price").find(".money").text(),
                sums = quants.next(".col-sum").find(".money"),
                counts = parseInt(quants.find(".count").val()),
                sercount = quants.parents(".shopcart-item").find(".service-count");
            if (sercount.length !== 0) {
                sercount.each(function () {
                    var sercosts = $(this).parent(".service-quant").next(".service-sum").find(".service-cost"),
                        sermoney = $(this).parent(".service-quant").prev(".service-price").find(".service-money").text();
                    $(this).text(counts);
                    sernum = $(this).text();
                    sercosts.html((sermoney * sernum).toFixed(2));
                });
            }
            if (isNaN(counts)) {
                sums.html((prices).toFixed(2));
            } else {
                sums.html((prices * counts).toFixed(2));
            }
            getcount();
        }
    }

    // spinner
    $(".spinner").each(function () {
        var obj = $(this),
            minus = $(this).find(".minus"),
            plus = $(this).find(".plus"),
            count = $(this).find(".count"),
            mins = parseInt(count.val()) || 1,
            maxs = parseInt(count.attr("max"));

        function output(str) {
            maxs = parseInt(count.attr("max"));
            bid = parseInt(count.attr("bid"));
            if (maxs == -1) maxs = 999;
            if (maxs == 0) {
                count.val(mins = 0);
                minus.addClass("minus-disabled");
                plus.addClass("plus-disabled");
            } else {
                mins == 1 && minus.addClass("minus-disabled") || minus.removeClass("minus-disabled");
                mins == maxs && plus.addClass("plus-disabled") || plus.removeClass("plus-disabled");
            }
            if (bid > 0 && str != 1) {
                $.post('/?do=shopcart&id=' + bid + '&num=' + count.val() + '&type=4', function (data) {
                    $("#shopcart-" + bid + " .col-price .money").text(data["price"]);
                    if (data["doing"]) {
                        $("#shopcart-" + bid + " .doing").text(data["doing"]).show();
                    } else {
                        $("#shopcart-" + bid + " .doing").hide();
                    }
                    minusclick("#shopcart-" + bid);
                    data = null;
                }, 'json');
            } else {
                minusclick();
            }
            count.change();
        }

        minus.unbind().click(function () {
            !$(this).is(".minus-disabled") && count.val(--mins), output();
        });
        plus.unbind().click(function () {
            !$(this).is(".plus-disabled") && count.val(++mins), output();
        });
        count.unbind().keyup(function () {
            maxs = parseInt(count.attr("max"));
            if (maxs == -1) maxs = 999;
            i = parseInt(count.val());
            i = i ? i : 1;
            i = i > maxs ? maxs : i;
            count.val(mins = i);
            output();
        });
        output(1);
    });

    $("#totop").hide();
    $(window).scroll(function () {
        $(window).scrollTop() > 300 ? $("#totop").show() : $("#totop").hide();
    });
    $("#totop").click(function () {
        $("body,html").animate({scrollTop: 0}, 500);
        return false;
    });

    /* data-hover="dropdown" */
    if ($('[data-hover="dropdown"]').length) {
        var $allDropdowns = $();
        $allDropdowns = $allDropdowns.add($('[data-hover="dropdown"]').parent());
        $('[data-hover="dropdown"]').each(function () {
            var $this = $(this),
                $parent = $this.parent(),
                delay = 500,
                timeoutHover;

            $parent.hover(function () {
                window.clearTimeout(timeoutHover);
                $allDropdowns.removeClass('open');
                if (!$parent.hasClass('open')) {
                    $parent.addClass('open');
                }
            }, function () {
                timeoutHover = window.setTimeout(function () {
                    $parent.removeClass('open');
                }, delay);
            });
        });
    }

    /* addcollect */
    $("#addcollect").click(function () {
        var ctrl = (navigator.userAgent.toLowerCase()).indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL';
        if (document.all) {
            window.external.addFavorite('http://www.lipin.com/', '专业二手卡回收 - 礼品网');
        } else if (window.sidebar) {
            window.sidebar.addPanel('专业二手卡回收 - 礼品网', 'http://www.lipin.com/', "");
        } else {
            alert('您可以通过快捷键' + ctrl + ' + D 加入到收藏夹');
        }
    });

    /* IE6 */
    if ('undefined' == typeof(document.body.style.maxHeight)) {
        /* form-control */
        $(".form-control").focus(function () {
            $(this).addClass("form-control-focus");
        }).hover(function () {
            $(this).addClass("form-control-hover");
        }, function () {
            $(this).removeClass("form-control-hover");
        });
        $(".form-control").blur(function () {
            $(this).removeClass("form-control-focus");
        });

        /* highlight li */
        $(".highlight > li:odd").addClass("odd");
        $(".highlight > li:even").addClass("even");
        $(".highlight > li").hover(function () {
            $(this).addClass("hover");
        }, function () {
            $(this).removeClass("hover");
        });

        /* table tr */
        $("table tr:odd").addClass("odd");
        $("table tr:even").addClass("even");
        $("table tr").hover(function () {
            $(this).addClass("hover");
        }, function () {
            $(this).removeClass("hover");
        });
    }

    // faq-group
    $(".faq-tite > a").click(function () {
        $(".faq-tite a").removeClass("open");
        $(".faq-cont").slideUp("fast");
        $(this).addClass("open");
        $(this).parent(".faq-tite").next(".faq-cont").slideDown("fast");
    });
});

// Javacsript Tab Change
function setTab(name, cursel, n) {
    for (i = 1; i <= n; i++) {
        var menu = document.getElementById(name + i);
        var con = document.getElementById("con_" + name + "_" + i);
        menu.className = i == cursel ? "active" : "";
        con.style.display = i == cursel ? "block" : "none";
    }
}