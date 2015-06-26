/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="../bower_components/jquery/dist/jquery.js" />
$.widget("vwidgets.gridder", {
    options: {
        data: [],
        emptyDataMessage: "No data available to show",
        css: { table: "table" },
        headerTemplate: [],
        fieldTemplate: [],
        hidefields: [],
        amalgateColumns: [],
        datetimefields: [],
        showPagination: true,
        showOnlyFields: [],
        paginationPageSize: 5,
        pageSize: 10
    },
    _privateData: {
        renderedrenderedPagination: false,
        currentPage: 1
    },
    _create: function () {
        this.element.addClass("vwidgetsgrid");
        this._render();
    },
    _setOption: function (key, value) {
        if (key === "value") {
            value = this._constrain(value);
        }
        this._super(key, value);
    },
    _setOptions: function (options) {
        this._super(options);
        this.refresh();
    },
    refresh: function () {
        var progress = this.options.value + "%";
        this.element.text(progress);
        if (this.options.value == 100) {
            this._trigger("complete", null, { value: 100 });
        }
    },
    _destroy: function () {
        this.element
            .removeClass("vwidgetsgrid")
            .html("");
    },
    _extractHeaders: function () {
        var headers = [];
        if (this.options.data.length > 0) {
            var obj = this.options.data[0];
            var f = function (a) {
                return a.toLowerCase() === key.toLowerCase();
            };
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && typeof obj[key] !== 'function') {
                    if (this.options.showOnlyMode) {
                         
                        if (($.grep(this.options.showOnlyFields, f)).length > 0) {
                            headers.push(key);
                        }
                    } else {
                       
                        if (($.grep(this.options.showOnlyFields, f)).length === 0) {
                            headers.push(key);
                        }
                    }
                }
            }
        }
        return headers;
    },
    _headerOutput: function () {
        var field = arguments[0];
        if (this.options.headerTemplate.length > 0) {
            for (var i = 0; i < this.options.headerTemplate.length; i++) {
                if (this.options.headerTemplate[i].fieldName.toLowerCase() === field.toLowerCase()) {
                    return this.options.headerTemplate[i].template(field);
                }
            }
        }
        return field;
    },
    _fieldOutput: function () {
        var fieldName = arguments[1];
        var field = arguments[0];
        if (this.options.fieldTemplate.length > 0) {
            for (var i = 0; i < this.options.fieldTemplate.length; i++) {
                if (this.options.fieldTemplate[i].fieldName.toLowerCase() === fieldName.toLowerCase()) {
                    return this.options.fieldTemplate[i].template(field);
                }
            }
        }
        if (this.options.datetimefields.length > 0) {
            for (var i = 0; i < this.options.datetimefields.length; i++) {
                if (this.options.datetimefields[i].toLowerCase() === fieldName.toLowerCase()) {
                    if (!(field === null || field === undefined || field === '')) {
                        var date = new Date(parseInt(field.substr(6)));
                        return date.toLocaleString();
                    } else {
                        return '';
                    }
                }
            }
        }
        return field;
    },
    _render: function () {
        this.element.html('');
        this.element.css({ "text-align": "center" });       
        // Extract headers to be displayed
        this._privateData.headers = this._extractHeaders();

        //calculate the pagination and render it
        if (this._privateData.headers.length > 0) {
            if (this.options.showPagination) {
                // this._renderPagination();
            }
        }
        var arrHTML = [];
        arrHTML.push('<table class=\'' + this.options.css.table + '\'>');
        arrHTML.push(' <thead>');
        if (this._privateData.headers.length > 0 || this._privateData.amalgateColumns.length > 0) {

            if (this.options.amalgateColumns.length > 0) {
                for (var i = 0; i < this.options.amalgateColumns.length; i++) {
                    if (this.options.amalgateColumns[i].prepend) {
                        arrHTML.push('  <th data-realname="amalgated">');
                        arrHTML.push(this.options.amalgateColumns[i].columnHeader);
                        arrHTML.push('</th>');
                    }
                }
            }

            if (this._privateData.headers.length > 0) {
                for (var i = 0; i < this._privateData.headers.length; i++) {
                    arrHTML.push('  <th data-realname="' + this._privateData.headers[i] + '">');
                    arrHTML.push(this._headerOutput([this._privateData.headers[i]]));
                    arrHTML.push('<span class=\'asc\'>&#9650;</span>');
                    arrHTML.push('<span class=\'desc\'>&#9660;</span>');
                    arrHTML.push('</th>');
                }
            }

            if (this.options.amalgateColumns.length > 0) {
                for (var i = 0; i < this.options.amalgateColumns.length; i++) {
                    if (!this.options.amalgateColumns[i].prepend) {
                        arrHTML.push('  <th data-realname="amalgated">');
                        arrHTML.push(this.options.amalgateColumns[i].columnHeader);
                        arrHTML.push('</th>');
                    }
                }
            }
        }
        else {
            arrHTML.push(this.options.emptyDataMessage);
        }

        arrHTML.push('  </thead>');
        arrHTML.push('  <tbody>');
        arrHTML.push('  </tbody>');
        arrHTML.push('</table>');
        this.element.append(arrHTML.join(''));
        // Start generating the rows
        this._renderRows();
        //Create binding for click event on header

        // $(" th", this).bind('click', function () {
        //     //console.log('Click event beign called on header');
        //     var data = $this.data('tablerender');
        //     if (!($(this).attr('data-realname') === "amalgated")) {
        //         this.options.sortField = $(this).attr('data-realname');
        //         $this.data('tablerender', data);
        //         this._sort.apply($this);
        //     }
        // });
    },
    _renderRows: function () {
     
        // Start generating the rows

        this.element.children('.' + this.options.css.table + ':first').children('tbody:first').html('');
        var arrHTML = [];

        // Pagination info is used to calculate which records to show
        var startrecord = 0, endrecord = 0;

        if (this.options.showPagination) {

            var currentpage = this._privateData.currentPage, currentpagesize = this.options.pageSize;
            startrecord = (currentpage) * currentpagesize - currentpagesize;

            if (startrecord < 0) {
                startrecord = 0;
            }

            if (startrecord + currentpagesize > this.options.data.length) {
                endrecord = this.options.data.length - 1;
            }
            else {
                endrecord = startrecord + currentpagesize - 1;
            }

        } else {
            startrecord = 0;
            endrecord = this.options.data.length - 1;
        }
        for (var i = startrecord; i <= endrecord; i++) {
            arrHTML = [];
            arrHTML.push('  <tr>');
            if (this.options.amalgateColumns.length > 0) {
                for (var am = 0; am < this.options.amalgateColumns.length; am++) {
                    if (this.options.amalgateColumns[am].prepend) {
                        arrHTML.push('<td>');
                        arrHTML.push(this.options.amalgateColumns[am].template(this.options.data[i]));
                        arrHTML.push('</td>');
                    }
                }
            }
            for (var j = 0; j < this._privateData.headers.length; j++) {
                arrHTML.push('  <td>');
                arrHTML.push(this._fieldOutput(this.options.data[i][this._privateData.headers[j]], this._privateData.headers[j]));
                arrHTML.push('  </td>');
            }
            if (this.options.amalgateColumns.length > 0) {
                for (var am = 0; am < this.options.amalgateColumns.length; am++) {
                    if (!this.options.amalgateColumns[am].prepend) {
                        arrHTML.push('<td>');
                        arrHTML.push(this.options.amalgateColumns[am].template(this.options.data[i]));
                        arrHTML.push('</td>');
                    }
                }
            }
            arrHTML.push('  </tr>');
            this.element.children('.' + this.options.css.table + ':first').children('tbody:first').append(arrHTML.join(''));
        }
    }
});