(function($) {
    "use strict";
    $.fn.autocomplete = function(options) {
        var url;
        if (arguments.length > 1) {
            url = options;
            options = arguments[1];
            options.url = url;
        } else if (typeof options === 'string') {
            url = options;
            options = {
                url: url
            };
        }
        var opts = $.extend({},
        $.fn.autocomplete.defaults, options);
        return this.each(function() {
            var $this = $(this);
            $this.data('autocompleter', new $.Autocompleter($this, $.meta ? $.extend({},
            opts, $this.data()) : opts));
        });
    };
    $.fn.autocomplete.defaults = {
        inputClass: 'acInput',
        loadingClass: 'acLoading',
        resultsClass: 'acResults',
        selectClass: 'acSelect',
        queryParamName: 'q',
        extraParams: {},
        remoteDataType: false,
        lineSeparator: '\n',
        cellSeparator: '|',
        minChars: 2,
        maxItemsToShow: 10,
        delay: 0,
        useCache: true,
        maxCacheLength: 10,
        matchSubset: true,
        matchCase: false,
        matchInside: true,
        mustMatch: false,
        selectFirst: false,
        selectOnly: false,
        showResult: null,
        preventDefaultReturn: true,
        preventDefaultTab: false,
        autoFill: false,
        filterResults: true,
        sortResults: true,
        sortFunction: null,
        onItemSelect: null,
        onNoMatch: null,
        onFinish: null,
        matchStringConverter: null,
        beforeUseConverter: null,
        autoWidth: 'min-width',
        useDelimiter: false,
        delimiterChar: ' ',
        delimiterKeyCode: 188,
        processData: null,
        onError: null
    };
    var sanitizeResult = function(result) {
        var value,
        data;
        var type = typeof result;
        if (type === 'string') {
            value = result;
            data = {};
        } else if ($.isArray(result)) {
            value = result[0];
            data = result.slice(1);
        } else if (type === 'object') {
            value = result.value;
            data = result.data;
        }
        value = String(value);
        if (typeof data !== 'object') {
            data = {};
        }
        return {
            value: value,
            data: data
        };
    };
    var sanitizeInteger = function(value, stdValue, options) {
        var num = parseInt(value, 10);
        options = options || {};
        if (isNaN(num) || (options.min && num < options.min)) {
            num = stdValue;
        }
        return num;
    };
    var makeUrlParam = function(name, value) {
        return [name, encodeURIComponent(value)].join('=');
    };
    var makeUrl = function(url, params) {
        var urlAppend = [];
        $.each(params, 
        function(index, value) {
            urlAppend.push(makeUrlParam(index, value));
        });
        if (urlAppend.length) {
            url += url.indexOf('?') === -1 ? '?': '&';
            url += urlAppend.join('&');
        }
        return url;
    };
    var sortValueAlpha = function(a, b, matchCase) {
        a = String(a.value);
        b = String(b.value);
        if (!matchCase) {
            a = a.toLowerCase();
            b = b.toLowerCase();
        }
        if (a > b) {
            return 1;
        }
        if (a < b) {
            return - 1;
        }
        return 0;
    };
    var plainTextParser = function(text, lineSeparator, cellSeparator) {
        var results = [];
        var i,
        j,
        data,
        line,
        value,
        lines;
        lines = String(text).replace('\r\n', '\n').split(lineSeparator);
        for (i = 0; i < lines.length; i++) {
            line = lines[i].split(cellSeparator);
            data = [];
            for (j = 0; j < line.length; j++) {
                data.push(decodeURIComponent(line[j]));
            }
            value = data.shift();
            results.push({
                value: value,
                data: data
            });
        }
        return results;
    };
    $.Autocompleter = function($elem, options) {
        if (!$elem || !($elem instanceof $) || $elem.length !== 1 || $elem.get(0).tagName.toUpperCase() !== 'INPUT') {
            throw new Error('Invalid parameter for jquery.Autocompleter, jQuery object with one element with INPUT tag expected.');
        }
        var self = this;
        this.options = options;
        this.cacheData_ = {};
        this.cacheLength_ = 0;
        this.selectClass_ = 'jquery-autocomplete-selected-item';
        this.keyTimeout_ = null;
        this.finishTimeout_ = null;
        this.lastKeyPressed_ = null;
        this.lastProcessedValue_ = null;
        this.lastSelectedValue_ = null;
        this.active_ = false;
        this.finishOnBlur_ = true;
        this.options.minChars = sanitizeInteger(this.options.minChars, $.fn.autocomplete.defaults.minChars, {
            min: 1
        });
        this.options.maxItemsToShow = sanitizeInteger(this.options.maxItemsToShow, $.fn.autocomplete.defaults.maxItemsToShow, {
            min: 0
        });
        this.options.maxCacheLength = sanitizeInteger(this.options.maxCacheLength, $.fn.autocomplete.defaults.maxCacheLength, {
            min: 1
        });
        this.options.delay = sanitizeInteger(this.options.delay, $.fn.autocomplete.defaults.delay, {
            min: 0
        });
        this.dom = {};
        this.dom.$elem = $elem;
        this.dom.$elem.attr('autocomplete', 'off').addClass(this.options.inputClass);
        this.dom.$results = $('<div></div>').hide().addClass(this.options.resultsClass).css({
            position: 'absolute'
        });
        $('body').append(this.dom.$results);
        $elem.keyup(function(e) {
            self.lastKeyPressed_ = e.keyCode;
            switch (self.lastKeyPressed_) {
            case self.options.delimiterKeyCode:
                if (self.options.useDelimiter && self.active_) {
                    self.selectCurrent();
                }
                break;
            case 35:
            case 36:
            case 16:
            case 17:
            case 18:
            case 37:
            case 39:
                break;
            case 38:
                e.preventDefault();
                if (self.active_) {
                    self.focusPrev();
                } else {
                    self.activate();
                }
                return false;
            case 40:
                e.preventDefault();
                if (self.active_) {
                    self.focusNext();
                } else {
                    self.activate();
                }
                return false;
            case 9:
                if (self.active_) {
                    self.selectCurrent();
                    if (self.options.preventDefaultTab) {
                        e.preventDefault();
                        return false;
                    }
                }
                break;
            case 13:
                if (self.active_) {
                    self.selectCurrent();
                    if (self.options.preventDefaultReturn) {
                        e.preventDefault();
                        return false;
                    }
                }
                break;
            case 27:
                if (self.active_) {
                    e.preventDefault();
                    self.deactivate(true);
                    return false;
                }
                break;
            default:
                self.activate();
            }
        });
        $elem.blur(function() {
            if (self.finishOnBlur_) {
                self.finishTimeout_ = setTimeout(function() {
                    self.deactivate(true);
                },
                200);
            }
        });
    };
    $.Autocompleter.prototype.position = function() {
        var offset = this.dom.$elem.offset();
        this.dom.$results.css({
            top: offset.top + this.dom.$elem.outerHeight(),
            left: offset.left
        });
    };
    $.Autocompleter.prototype.cacheRead = function(filter) {
        var filterLength,
        searchLength,
        search,
        maxPos,
        pos;
        if (this.options.useCache) {
            filter = String(filter);
            filterLength = filter.length;
            if (this.options.matchSubset) {
                searchLength = 1;
            } else {
                searchLength = filterLength;
            }
            while (searchLength <= filterLength) {
                if (this.options.matchInside) {
                    maxPos = filterLength - searchLength;
                } else {
                    maxPos = 0;
                }
                pos = 0;
                while (pos <= maxPos) {
                    search = filter.substr(0, searchLength);
                    if (this.cacheData_[search] !== undefined) {
                        return this.cacheData_[search];
                    }
                    pos++;
                }
                searchLength++;
            }
        }
        return false;
    };
    $.Autocompleter.prototype.cacheWrite = function(filter, data) {
        if (this.options.useCache) {
            if (this.cacheLength_ >= this.options.maxCacheLength) {
                this.cacheFlush();
            }
            filter = String(filter);
            if (this.cacheData_[filter] !== undefined) {
                this.cacheLength_++;
            }
            this.cacheData_[filter] = data;
            return this.cacheData_[filter];
        }
        return false;
    };
    $.Autocompleter.prototype.cacheFlush = function() {
        this.cacheData_ = {};
        this.cacheLength_ = 0;
    };
    $.Autocompleter.prototype.callHook = function(hook, data) {
        var f = this.options[hook];
        if (f && $.isFunction(f)) {
            return f(data, this);
        }
        return false;
    };
    $.Autocompleter.prototype.activate = function() {
        var self = this;
        if (this.keyTimeout_) {
            clearTimeout(this.keyTimeout_);
        }
        this.keyTimeout_ = setTimeout(function() {
            self.activateNow();
        },
        this.options.delay);
    };
    $.Autocompleter.prototype.activateNow = function() {
        var value = this.beforeUseConverter(this.dom.$elem.val());
        if (value !== this.lastProcessedValue_ && value !== this.lastSelectedValue_) {
            this.fetchData(value);
        }
    };
    $.Autocompleter.prototype.fetchData = function(value) {
        var self = this;
        var processResults = function(results, filter) {
            if (self.options.processData) {
                results = self.options.processData(results);
            }
            self.showResults(self.filterResults(results, filter), filter);
        };
        this.lastProcessedValue_ = value;
        if (value.length < this.options.minChars) {
            processResults([], value);
        } else if (this.options.data) {
            processResults(this.options.data, value);
        } else {
            this.fetchRemoteData(value, 
            function(remoteData) {
                processResults(remoteData, value);
            });
        }
    };
    $.Autocompleter.prototype.fetchRemoteData = function(filter, callback) {
        var data = this.cacheRead(filter);
        if (data) {
            callback(data);
        } else {
            var self = this;
            var dataType = self.options.remoteDataType === 'json' ? 'json': 'text';
            var ajaxCallback = function(data) {
                var parsed = false;
                if (data !== false) {
                    parsed = self.parseRemoteData(data);
                    self.cacheWrite(filter, parsed);
                }
                self.dom.$elem.removeClass(self.options.loadingClass);
                callback(parsed);
            };
            var ajaxCallback1 = function(data) {}
            this.dom.$elem.addClass(this.options.loadingClass);
            $.ajax({
                url: this.makeUrl(filter),
                success: ajaxCallback,
                jsonpCallback: 'ajaxCallback1',
                error: function(jqXHR, textStatus, errorThrown) {
                    if ($.isFunction(self.options.onError)) {
                        self.options.onError(jqXHR, textStatus, errorThrown);
                    } else {
                        ajaxCallback(false);
                    }
                },
                dataType: 'jsonp'
            });
        }
    };
    $.Autocompleter.prototype.setExtraParam = function(name, value) {
        var index = $.trim(String(name));
        if (index) {
            if (!this.options.extraParams) {
                this.options.extraParams = {};
            }
            if (this.options.extraParams[index] !== value) {
                this.options.extraParams[index] = value;
                this.cacheFlush();
            }
        }
    };
    $.Autocompleter.prototype.makeUrl = function(param) {
        var self = this;
        var url = this.options.url;
        var params = $.extend({},
        this.options.extraParams);
        if (this.options.queryParamName === false) {
            url += encodeURIComponent(param);
        } else {
            params[this.options.queryParamName] = param;
        }
        return makeUrl(url, params);
    };
    $.Autocompleter.prototype.parseRemoteData = function(remoteData) {
        var remoteDataType;
        var data = remoteData;
        if (this.options.remoteDataType === 'json') {
            remoteDataType = typeof(remoteData);
            switch (remoteDataType) {
            case 'object':
                data = remoteData;
                break;
            case 'string':
                data = $.parseJSON(remoteData);
                break;
            default:
                throw new Error("Unexpected remote data type: " + remoteDataType);
            }
            return data;
        }
        return plainTextParser(data, this.options.lineSeparator, this.options.cellSeparator);
    };
    $.Autocompleter.prototype.filterResult = function(result, filter) {
        if (!result.value) {
            return false;
        }
        if (this.options.filterResults) {
            var pattern = this.matchStringConverter(filter);
            var testValue = this.matchStringConverter(result.value);
            if (!this.options.matchCase) {
                pattern = pattern.toLowerCase();
                testValue = testValue.toLowerCase();
            }
            var patternIndex = testValue.indexOf(pattern);
            if (this.options.matchInside) {
                return patternIndex > -1;
            } else {
                return patternIndex === 0;
            }
        }
        return true;
    };
    $.Autocompleter.prototype.filterResults = function(results, filter) {
        var filtered = [];
        var i,
        result;
        for (i = 0; i < results.length; i++) {
            result = sanitizeResult(results[i]);
            if (this.filterResult(result, filter)) {
                filtered.push(result);
            }
        }
        if (this.options.sortResults) {
            filtered = this.sortResults(filtered, filter);
        }
        if (this.options.maxItemsToShow > 0 && this.options.maxItemsToShow < filtered.length) {
            filtered.length = this.options.maxItemsToShow;
        }
        return filtered;
    };
    $.Autocompleter.prototype.sortResults = function(results, filter) {
        var self = this;
        var sortFunction = this.options.sortFunction;
        if (!$.isFunction(sortFunction)) {
            sortFunction = function(a, b, f) {
                return sortValueAlpha(a, b, self.options.matchCase);
            };
        }
        results.sort(function(a, b) {
            return sortFunction(a, b, filter, self.options);
        });
        return results;
    };
    $.Autocompleter.prototype.matchStringConverter = function(s, a, b) {
        var converter = this.options.matchStringConverter;
        if ($.isFunction(converter)) {
            s = converter(s, a, b);
        }
        return s;
    };
    $.Autocompleter.prototype.beforeUseConverter = function(s, a, b) {
        s = this.getValue();
        var converter = this.options.beforeUseConverter;
        if ($.isFunction(converter)) {
            s = converter(s, a, b);
        }
        return s;
    };
    $.Autocompleter.prototype.enableFinishOnBlur = function() {
        this.finishOnBlur_ = true;
    };
    $.Autocompleter.prototype.disableFinishOnBlur = function() {
        this.finishOnBlur_ = false;
    };
    $.Autocompleter.prototype.createItemFromResult = function(result) {
        var self = this;
        var $li = $('<li><a href="' + result.data + '" target="_blank">' + this.showResult(result.value, result.data).replace(this.lastProcessedValue_, '<strong>' + this.lastProcessedValue_ + '</strong>') + '</a></li>');
        $li.data({
            value: result.value,
            data: result.data
        }).click(function() {}).mousedown(self.disableFinishOnBlur).mouseup(self.enableFinishOnBlur);
        return $li;
    };
    $.Autocompleter.prototype.getItems = function() {
        return $('>ul>li', this.dom.$results);
    };
    $.Autocompleter.prototype.showResults = function(results, filter) {
        var numResults = results.length;
        var self = this;
        var $ul = $('<ul></ul>');
        var i,
        result,
        $li,
        autoWidth,
        first = false,
        $first = false;
        if (numResults) {
            for (i = 0; i < numResults; i++) {
                result = results[i];
                $li = this.createItemFromResult(result);
                $ul.append($li);
                if (first === false) {
                    first = String(result.value);
                    $first = $li;
                    $li.addClass(this.options.firstItemClass);
                }
                if (i === numResults - 1) {
                    $li.addClass(this.options.lastItemClass);
                }
            }
            this.position();
            this.dom.$results.html($ul).show();
            if (this.options.autoWidth) {
                autoWidth = this.dom.$elem.outerWidth() - this.dom.$results.outerWidth() + this.dom.$results.width();
                this.dom.$results.css(this.options.autoWidth, autoWidth);
            }
            this.getItems().hover(function() {
                self.focusItem(this);
            },
            function() {});
            if (this.autoFill(first, filter) || this.options.selectFirst || (this.options.selectOnly && numResults === 1)) {
                this.focusItem($first);
            }
            this.active_ = true;
        } else {
            this.hideResults();
            this.active_ = false;
        }
    };
    $.Autocompleter.prototype.showResult = function(value, data) {
        if ($.isFunction(this.options.showResult)) {
            return this.options.showResult(value, data);
        } else {
            return value;
        }
    };
    $.Autocompleter.prototype.autoFill = function(value, filter) {
        var lcValue,
        lcFilter,
        valueLength,
        filterLength;
        if (this.options.autoFill && this.lastKeyPressed_ !== 8) {
            lcValue = String(value).toLowerCase();
            lcFilter = String(filter).toLowerCase();
            valueLength = value.length;
            filterLength = filter.length;
            if (lcValue.substr(0, filterLength) === lcFilter) {
                var d = this.getDelimiterOffsets();
                var pad = d.start ? ' ': '';
                this.setValue(pad + value);
                var start = filterLength + d.start + pad.length;
                var end = valueLength + d.start + pad.length;
                this.selectRange(start, end);
                return true;
            }
        }
        return false;
    };
    $.Autocompleter.prototype.focusNext = function() {
        this.focusMove( + 1);
    };
    $.Autocompleter.prototype.focusPrev = function() {
        this.focusMove( - 1);
    };
    $.Autocompleter.prototype.focusMove = function(modifier) {
        var $items = this.getItems();
        modifier = sanitizeInteger(modifier, 0);
        if (modifier) {
            for (var i = 0; i < $items.length; i++) {
                if ($($items[i]).hasClass(this.selectClass_)) {
                    this.focusItem(i + modifier);
                    return;
                }
            }
        }
        this.focusItem(0);
    };
    $.Autocompleter.prototype.focusItem = function(item) {
        var $item,
        $items = this.getItems();
        if ($items.length) {
            $items.removeClass(this.selectClass_).removeClass(this.options.selectClass);
            if (typeof item === 'number') {
                if (item < 0) {
                    item = 0;
                } else if (item >= $items.length) {
                    item = $items.length - 1;
                }
                $item = $($items[item]);
            } else {
                $item = $(item);
            }
            if ($item) {
                $item.addClass(this.selectClass_).addClass(this.options.selectClass);
            }
        }
    };
    $.Autocompleter.prototype.selectCurrent = function() {
        var $item = $('li.' + this.selectClass_, this.dom.$results);
        if ($item.length === 1) {
            this.selectItem($item);
        } else {
            this.deactivate(false);
        }
    };
    $.Autocompleter.prototype.selectItem = function($li) {
        var value = $li.data('value');
        var data = $li.data('data');
        var displayValue = this.displayValue(value, data);
        var processedDisplayValue = this.beforeUseConverter(displayValue);
        this.lastProcessedValue_ = processedDisplayValue;
        this.lastSelectedValue_ = processedDisplayValue;
        var d = this.getDelimiterOffsets();
        var delimiter = this.options.delimiterChar;
        var elem = this.dom.$elem;
        var extraCaretPos = 0;
        if (this.options.useDelimiter) {
            if (elem.val().substring(d.start - 1, d.start) == delimiter && delimiter != ' ') {
                displayValue = ' ' + displayValue;
            }
            if (elem.val().substring(d.end, d.end + 1) != delimiter && this.lastKeyPressed_ != this.options.delimiterKeyCode) {
                displayValue = displayValue + delimiter;
            } else {
                extraCaretPos = 1;
            }
        }
        this.setValue(displayValue);
        this.setCaret(d.start + displayValue.length + extraCaretPos);
        this.callHook('onItemSelect', {
            value: value,
            data: data
        });
        this.deactivate(true);
        elem.focus();
    };
    $.Autocompleter.prototype.displayValue = function(value, data) {
        if ($.isFunction(this.options.displayValue)) {
            return this.options.displayValue(value, data);
        }
        return value;
    };
    $.Autocompleter.prototype.hideResults = function() {
        this.dom.$results.hide();
    };
    $.Autocompleter.prototype.deactivate = function(finish) {
        if (this.finishTimeout_) {
            clearTimeout(this.finishTimeout_);
        }
        if (this.keyTimeout_) {
            clearTimeout(this.keyTimeout_);
        }
        if (finish) {
            if (this.lastProcessedValue_ !== this.lastSelectedValue_) {
                if (this.options.mustMatch) {
                    this.setValue('');
                }
                this.callHook('onNoMatch');
            }
            if (this.active_) {
                this.callHook('onFinish');
            }
            this.lastKeyPressed_ = null;
            this.lastProcessedValue_ = null;
            this.lastSelectedValue_ = null;
            this.active_ = false;
        }
        this.hideResults();
    };
    $.Autocompleter.prototype.selectRange = function(start, end) {
        var input = this.dom.$elem.get(0);
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(start, end);
        } else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    };
    $.Autocompleter.prototype.setCaret = function(pos) {
        this.selectRange(pos, pos);
    };
    $.Autocompleter.prototype.getCaret = function() {
        var elem = this.dom.$elem;
        if ($.browser.msie) {
            var selection = document.selection;
            if (elem[0].tagName.toLowerCase() != 'textarea') {
                var val = elem.val();
                var range = selection.createRange().duplicate();
                range.moveEnd('character', val.length);
                var s = (range.text == '' ? val.length: val.lastIndexOf(range.text));
                range = selection.createRange().duplicate();
                range.moveStart('character', -val.length);
                var e = range.text.length;
            } else {
                var range = selection.createRange();
                var stored_range = range.duplicate();
                stored_range.moveToElementText(elem[0]);
                stored_range.setEndPoint('EndToEnd', range);
                var s = stored_range.text.length - range.text.length;
                var e = s + range.text.length;
            }
        } else {
            var s = elem[0].selectionStart;
            var e = elem[0].selectionEnd;
        }
        return {
            start: s,
            end: e
        };
    };
    $.Autocompleter.prototype.setValue = function(value) {
        if (this.options.useDelimiter) {
            var val = this.dom.$elem.val();
            var d = this.getDelimiterOffsets();
            var preVal = val.substring(0, d.start);
            var postVal = val.substring(d.end);
            value = preVal + value + postVal;
        }
        this.dom.$elem.val(value);
    };
    $.Autocompleter.prototype.getValue = function() {
        var val = this.dom.$elem.val();
        if (this.options.useDelimiter) {
            var d = this.getDelimiterOffsets();
            return $.trim(val.substring(d.start, d.end));
        } else {
            return val;
        }
    };
    $.Autocompleter.prototype.getDelimiterOffsets = function() {
        var val = this.dom.$elem.val();
        if (this.options.useDelimiter) {
            var preCaretVal = val.substring(0, this.getCaret().start);
            var start = preCaretVal.lastIndexOf(this.options.delimiterChar) + 1;
            var postCaretVal = val.substring(this.getCaret().start);
            var end = postCaretVal.indexOf(this.options.delimiterChar);
            if (end == -1) end = val.length;
            end += this.getCaret().start;
        } else {
            start = 0;
            end = val.length;
        }
        return {
            start: start,
            end: end
        };
    };
})(jQuery);