var app = angular.module('shop', ['ngRoute','ngAnimate', 'ui.bootstrap']);
app.controller('indexController', function($scope,$location,$http,$window) {
    var url = 'http://localhost:49859/';
    //var url = 'http://localhost:4567/';
    sessionStorage.setItem('url', url);
    $scope.currentPath = $location.path();
	$scope.searchType = {
		0 : 'Manufacturers',
		1 : 'Categories',
		2 : 'Product Types',
        3 : 'Products'
	}
    $scope.viewCart = function(){
		$window.location.href = '#/cart';
	};
	
	$scope.getCriteria = function(val) {
	    val = val.toLowerCase();
	    if ($.trim(val).length > 3) {
	        return $http.get(sessionStorage.getItem('url') + 'api/search/GetSearchList?keyword=' + val).then(function (response) {

	            var searchResultArr = [];
	            if (response.data.Records.length > 5) {
	                searchResultArr = response.data.Records.slice(0,5).map(function (rec) {
	                    return {
	                        Id: rec.Id,
	                        Type: rec.RecordType,
	                        Text: rec.Name + " in " + $scope.searchType[rec.RecordType]
	                    }
	                });
	            }
	            return searchResultArr.concat({
	                Id: 0,
	                Type: 3,
					Text : 'All products with ' + val+ ''
	                ///Text: "<span style='text-decoration: underline;'> View all with '" + val + "'</span> <span class='glyphicon glyphicon-chevron-right'></span>"
	            });
	        });
	    }
	  };
	$scope.search = function(selected) {
	    var searchObj = {};
	    var IDs = [];
	    searchObj[selected.Type] = IDs.push[selected.Name];
	    var input = {
	        search : searchObj,
	        sortBy : null,
	        pageNo : 1
	    }
	    $scope.currentSearchInput = input;

	    var pageSize = 10;
	    $('.product-list').hide();
	    $http.post(sessionStorage.getItem('url') + "api/search/GetSearchResultByOptions", input).then(function (response) {
	        $('ul.pagination').html('');
	        $scope.products = response.data.Rows;
	        $scope.totalPages = Math.ceil(response.data.TotalRecords / 10);
	        if (response.data.Rows && response.data.Rows.length) {
	            $('.pagination-container').show();
	            $('.product-list').show();
	        }
	        else {
	            $('.no-records').show();
	        }
	        var pageNos = $scope.totalPages > 5 ? 5 : $scope.totalPages;
	        for (var i = 1; i <= pageNos; i++) {
	            if (i == input.pageNo) {
	                $('ul.pagination').append('<li class="active" data-id="' + i + '"><a >' + i + '</a></li>')
	            }
	            else {
	                $('ul.pagination').append('<li data-id="' + i + '"><a >' + i + '</a></li>')
	            }

	        }
	    });
  	};
	
	//get Call
	/*$http.get("welcome.htm").then(function (response) {
        $scope.myWelcome = response.data;
    });*/

});

app.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/', {
                templateUrl : 'pages/home.html',
                controller  : 'homeController'
            })

            // route for the contact page
            .when('/contact', {
                templateUrl: 'pages/contact.html',
                controller: 'contactController'
            })

            // route for the contact page
            .when('/about', {
                templateUrl: 'pages/about.html',
                controller: 'aboutController'
            })

            // route for the cart page
            .when('/cart', {
                templateUrl : 'pages/cart.html',
                controller  : 'cartController'
            })

            // route for the product page
            .when('/product/:pid', {
                templateUrl : 'pages/product.html',
                controller  : 'productController'
            })
			
			.when('/products', {
                templateUrl : 'pages/products.html',
                controller  : 'productsController'
            })
			
			.otherwise({
				redirectTo: '/'
			});
			
			;
    });
	
app.controller('homeController', function($scope,$location,$http,$window) {
    //get Call
    $scope.pageNo = 0;

    $scope.getPopularProducts = function(pageNo){
        $http.get(sessionStorage.getItem('url') + 'api/search/GetPopularProducts?pageNo='+pageNo+'&pageSize=5').then(function (response) {
            $scope.totalPages = response.data.TotalRecords;
            $scope.popularProducts = response.data.Rows.slice(0,5);
        
        });
    }
    $scope.getPopularProducts($scope.pageNo);

    $scope.myInterval = 3000;
    $scope.noWrapSlides = false;
    $scope.active = 0;
    var slides = $scope.slides = [];
    var currIndex = 0;
    var catArr = [
        { image: '/img/slider/1_Flash.jpg' },
        { image: '/img/slider/2_Flash.jpg' },
        { image: '/img/slider/3_Flash_Caliper.jpg' },
        { image: '/img/slider/3_Flash_Micrometer.jpeg' },
        { image: '/img/slider/4_Flash_Dial.jpg' },
        { image: '/img/slider/5_Flash_Gauge_Blocks.jpg' },
        { image: '/img/slider/6_Flash_SJ-210.png' }
    ];
    $scope.addSlide = function() {
        var newWidth = 600 + slides.length + 1;
        slides.push({
            image: catArr[currIndex].image,
            //text: [catArr[currIndex].category][slides.length % 1],
            id: currIndex++
        });
    };

    $scope.randomize = function() {
        var indexes = generateIndexesArray();
        assignNewIndexesToSlides(indexes);
    };

    for (var i = 0; i < 7; i++) {
        $scope.addSlide();
    }

    // Randomize logic below

    function assignNewIndexesToSlides(indexes) {
        for (var i = 0, l = slides.length; i < l; i++) {
            slides[i].id = indexes.pop();
        }
    }

    function generateIndexesArray() {
        var indexes = [];
        for (var i = 0; i < currIndex; ++i) {
            indexes[i] = i;
        }
        return shuffle(indexes);
    }

    // http://stackoverflow.com/questions/962802#962890
    function shuffle(array) {
        var tmp, current, top = array.length;

        if (top) {
            while (--top) {
                current = Math.floor(Math.random() * (top + 1));
                tmp = array[current];
                array[current] = array[top];
                array[top] = tmp;
            }
        }

        return array;
    }

});
app.controller('cartController', function ($scope, $location, $http, $window) {
    $scope.cities = [];
    $scope.city = "";
    $scope.state = "";
    $http.get('/json/cities.json').success(function(data) {
        $scope.cities = data.cities;
    });
    $scope.setState = function(city){
        $scope.state = $scope.city.state;
    }
    $('#confirm-order').click(function () {
        $('#confirm-form').show();
    });
    $scope.cartItems = JSON.parse(localStorage.getItem('cart'));
    $('#view-cart .badge').text(function () {
        return $scope.cartItems.length
    })
    setTimeout(function () {
        $('#cart-details').show();
    }, 1000);

    $scope.deleteFromCart = function (product) {
        $scope.cartItems = $scope.cartItems.filter(function (obj) {
            return obj.Id != product.Id
        });
        localStorage.setItem('cart', JSON.stringify($scope.cartItems));
        $('#view-cart .badge').text(function () {
            return $scope.cartItems.length
        });
    };
	
	//get Call
	/*$http.get("welcome.htm").then(function (response) {
        $scope.myWelcome = response.data;
    });*/
});
app.controller('productController', function ($scope, $location, $http, $window, $routeParams) {
	//get Call
    $http.get(sessionStorage.getItem('url') + 'api/search/GetProductById?id=' + $routeParams.pid).then(function (response) {
        $scope.product = response.data;

    });
});
app.controller('productsController', function ($scope, $location, $http, $window) {

    $scope.manufacturers = [];
    $scope.categoryTypes = [];
    $scope.productTypes = [];
    $scope.isManufacturerExpanded = true;
    $scope.isCategoryExpanded = false;
    $scope.isProductTypeExpanded = false;
    $scope.selectedManufacturers = [];
    $scope.selectedCategories = [];
    $scope.selectedProducts = [];
    $scope.totalCategories = 0;
    $scope.totalProductTypes = 0;
    $scope.cartItems = [];
    
    $scope.getCategoryTypes = function () {
        return $scope.categoryTypes;
    };
    init();
    function init() {
        $http.get(sessionStorage.getItem('url') + 'api/search/GetSearchOptions').then(function (response) {
            $scope.manufacturers = response.data.Manufacturers;
            for (i = 0; i < $scope.manufacturers.length; i++) {
                $scope.categoryTypes = $scope.categoryTypes.concat($scope.manufacturers[i].Categories);
            }
            $scope.isCategoryExpanded = true;
        });
        $('#shiftLeft').click(function () {
            var $ul = $('ul.pagination');
            var $lis = $('li', $ul);
            var $curr = $ul.find('li.active');
            var currentPage = parseInt($curr.data('id'));
            var currentFirst = parseInt($lis.first().data('id'));
            if (currentPage != 1) {
                $curr.removeClass('active');
            }
            if (currentPage > 1) {
                if (currentPage == currentFirst) {
                    $lis.last().remove();
                    $ul.prepend('<li data-id="' + (currentPage - 1) + '"><a >' + (currentPage - 1) + '</a></li>');
                }
                $('ul.pagination').find('li[data-id=' + (currentPage - 1) + ']').addClass('active');
            }
            var input = $scope.currentSearchInput;
            window.scrollTo(0, 0);
            input.pageNo = parseInt((currentFirst - 1));
            if (input.pageNo <= $scope.totalPages) {
                getSearchData(input, false);
            }
        });
        $('#shiftRight').click(function () {
            var $ul = $('ul.pagination');
            var $lis = $('li', $ul);
            var $curr = $ul.find('li.active');
            var currentPage = parseInt($curr.data('id'));
            var currentLast = parseInt($lis.last().data('id'));
            if (currentPage != $scope.totalPages) {
                $curr.removeClass('active');
            }
            if (currentPage < $scope.totalPages) {
                if (currentPage == currentLast) {
                    $lis.first().remove();
                    $ul.append('<li data-id="' + (currentPage + 1) + '"><a >' + (currentPage + 1) + '</a></li>');
                }
                $('ul.pagination').find('li[data-id=' + (currentPage + 1) + ']').addClass('active');
            }
            var input = $scope.currentSearchInput;
            window.scrollTo(0, 0);
            input.pageNo = parseInt((currentLast + 1));
            if (input.pageNo <= $scope.totalPages) {
                getSearchData(input, false);
            }
        });

        $('ul.pagination').on('click','li:not(.active)',function () {
            var $ul = $('ul.pagination');
            var $lis = $('li', $ul);
            $lis.removeClass('active');
            $(this).addClass('active');
            var input = $scope.currentSearchInput;
            window.scrollTo(0, 0);
            input.pageNo = parseInt($(this).data('id'));
            if (input.pageNo <= $scope.totalPages) {
                getSearchData(input, false);
            }

        })
        $(window).scroll(function () {
            if ($(this).scrollTop()) {
                $('#scrollTop').fadeIn();
            } else {
                $('#scrollTop').fadeOut();
            }
        });
        $('#scrollTop').click(function () {
            window.scrollTo(0, 0);
        });
    }

    $scope.getCategories = function (selectAll) {
        $scope.categoryTypes = [];
        if (selectAll) {
            $scope.isManufacturerExpanded = true;
            var check = $('.manufacturer > div:first :checkbox').prop('checked');
            $('.manufacturer :checkbox').prop('checked', check);
            var $checked = $('.manufacturer > div:last :checked').map(function () {
                return $(this).data('id')
            });
            for (i = 0; i < $scope.manufacturers.length; i++) {
                if ($.inArray($scope.manufacturers[i].Id, $checked) > -1) {
                    $scope.categoryTypes = $scope.categoryTypes.concat($scope.manufacturers[i].Categories)
                }
            }
            $scope.isCategoryExpanded = true;
            $scope.$apply();
        }
        else {
            var $checked = $('.manufacturer > div:last :checked').map(function () {
                return $(this).data('id')
            });
            for (i = 0; i < $scope.manufacturers.length; i++) {
                if ($.inArray($scope.manufacturers[i].Id, $checked)> -1) {
                    $scope.categoryTypes = $scope.categoryTypes.concat($scope.manufacturers[i].Categories);
                }
            }
            $scope.isCategoryExpanded = true;
            $scope.$apply();
        }
        
    }

    $scope.getProductTypes = function (selectAll) {
        $scope.productTypes = [];
        $scope.selectedCategories = [];
        if (selectAll) {
            $scope.isCategoryExpanded = true;
            var check = $('.category-type > div:first :checkbox').prop('checked');
            $('.category-type :checkbox').prop('checked', check);
            var $checked = $('.category-type > div:last :checked').map(function () {
                return $(this).data('id')
            }).get();
            if ($checked.length == 0) {
                $('.product-type .badge').text(0);
            }
            for (i = 0; i < $scope.categoryTypes.length; i++) {
                if ($checked.indexOf($scope.categoryTypes[i].Id) > -1) {
                    $scope.selectedCategories = $scope.selectedCategories.concat($scope.categoryTypes[i].Id);
                    $scope.productTypes = $scope.productTypes.concat($scope.categoryTypes[i].ProductTypes)
                }
            }
            $scope.isProductTypeExpanded = $checked.length > 0;
            $scope.totalCategories = $checked.length;
            $scope.$apply();
        }
        else {
            var $checked = $('.category-type > div:last :checked').map(function () {
                return $(this).data('id')
            }).get();
            if ($checked.length == 0) {
                $('.product-type .badge').text(0);
            }

            for (i = 0; i < $scope.categoryTypes.length; i++) {
                if ($checked.indexOf($scope.categoryTypes[i].Id) > -1) {
                    $scope.selectedCategories = $scope.selectedCategories.concat($scope.categoryTypes[i].Id);
                    $scope.productTypes = $scope.productTypes.concat($scope.categoryTypes[i].ProductTypes);
                }
            }
            $scope.isProductTypeExpanded = $checked.length > 0;
            $scope.totalCategories = $checked.length;
            $scope.$apply();
        }
    }

    $scope.setProductTypes = function (selectAll) {
        //$scope.productTypes = [];

        var $checked = $('.product-type > div:last :checked');
        if (selectAll) {
            $scope.isProductTypeExpanded = true;
            var check = $('.product-type div:first :checkbox').prop('checked');
            $('.product-type :checkbox').prop('checked', check);
            $scope.selectedProducts = $checked.map(function () {
                return $(this).data('id')
            }).get();
            $checked = $('.product-type > div:last :checked');

        }
        else {
            $scope.selectedProducts = $checked.map(function () {
                return $(this).data('id')
            }).get();
            
        }
        $('.product-type .badge').text($checked.length);
        
    }

    $scope.removeFilters = function () {
        $('.category-type :checkbox').prop('checked', false);
        $scope.getProductTypes();
    }

    $scope.applyFilters = function () {
        
        var searchObj = {};
        searchObj[1] = $scope.selectedCategories;
        searchObj[2] = $scope.selectedProducts;
        var pageNo = 1;

        var input = {
            search: searchObj,
            sortBy: null,
            pageNo: pageNo,
        }
        $scope.currentSearchInput = input;

        getSearchData(input,true);
    }

    $scope.searchProducts = function (page) {
        var input = $scope.currentSearchInput;
        input.pageNo = page;
        getSearchData(input, true);
    }

    $scope.addToCart = function (product) {
        var input = $('#spinEdit-' + product.Id).val();
        var items = JSON.parse(localStorage.getItem('cart'));
        var item = {
            Id: product.Id,
            Name: product.Name,
            Qty: input
        };
        console.log(items);
        if (!items || items == "") {
            items = [];
            
            items.push(item);
            $scope.cartItems.push(item)
        }
        else {
            items = items.filter(function (obj) {
                return obj.Id !== product.Id;
            });
            items.push(item);
            $scope.cartItems.push(item)
        }
        localStorage.setItem('cart', JSON.stringify(items));

        $('#view-cart').fadeOut(300).fadeIn(300);
        $('#view-cart .badge').text(function () {
            return items.length
        })       
    }

    function getSearchData(input, flag) {
        window.scrollTo(0, 0);
        var pageSize = 10;
        $('.product-list').hide();
        $http.post(sessionStorage.getItem('url') + "api/search/GetSearchResultByOptions", input).then(function (response) {
            
            $scope.products = response.data.Rows;
            if (response.data.Rows && response.data.Rows.length) {
                $('.pagination-container').show();
                $('.product-list').show();
            }
            else {
                $('.no-records').show();
            }
            if (flag) {
                $('ul.pagination').html('');
                $scope.totalPages = Math.ceil(response.data.TotalRecords / 10);

                var pageNos = $scope.totalPages > 5 ? 5 : $scope.totalPages;
                for (var i = 1; i <= pageNos; i++) {
                    if (i == input.pageNo) {
                        $('ul.pagination').append('<li class="active" data-id="' + i + '"><a >' + i + '</a></li>')
                    }
                    else {
                        $('ul.pagination').append('<li data-id="' + i + '"><a >' + i + '</a></li>')
                    }

                }
            }
        });
    }
    //get Call
    /*$http.get("welcome.htm").then(function (response) {
        $scope.myWelcome = response.data;
    });*/
});