let data = [];
const dataList = document.querySelector('.dataList');
const searchText = document.querySelector('.searchText');
const filterBox = document.querySelector('.filterBox');
const filterBtn = document.querySelectorAll('.filterBtn');

let pageNum = 0;
let allPageNum = 0;
const pageNumText = document.querySelector('.pageNumText');
const allPageNumText = document.querySelector('.allPageNumText');
const switchPageBox = document.querySelector('.switchPageBox');
const previousPageBtn = document.querySelector('.previousPageBtn');
const nextPageBtn = document.querySelector('.nextPageBtn');
const searchInput = document.querySelector('.searchInput');
const searchBtn = document.querySelector('.searchBtn');

const orderDrop = document.querySelector('.orderDrop');
const sortBtn = document.querySelectorAll('.sortBtn');
const dropdownToggle = document.querySelectorAll('.dropdown-toggle');
const tableHeader = document.querySelector('.tableHeader');
let sortItem = '';
let sortState = true;

//篩選類別
filterBox.addEventListener("click", e => {
    let filter = e.target.value;
    if (filter === "蔬菜") {
        filterClick(0, filter);
    } else if (filter === "水果") {
        filterClick(1, filter);
    } else if (filter === "花卉") {
        filterClick(2, filter);
    }
})
function filterClick(num, filter) {
    filterBtn.forEach((item, index) => {
        if (index === num) {
            item.classList.add('checked');
        } else {
            item.classList.remove('checked');
        }
    })
    getData(filter);
    searchText.textContent = (num === "") ? `查看「${filter}」的比價結果` : "";
}

//串接資料
function getData(filter) {
    axios.get('https://data.coa.gov.tw/Service/OpenData/FromM/FarmTransData.aspx')
        .then(function (response) {
            data = response.data.filter(item => {
                if (filter === "蔬菜") return item.種類代碼 === "N04";
                else if (filter === "水果") return item.種類代碼 === "N05";
                else if (filter === "花卉") return item.種類代碼 === "N06";
                else return item.作物名稱 != null && item.作物名稱.includes(filter) == true
            })
            //頁數計算
            let quotient = data.length % 6;
            let remainder = (data.length - quotient) / 6;
            allPageNum = (quotient == 0) ? remainder : remainder + 1;
            pageNum = (data.length == 0) ? 0 : 1;
            renderTable();
        });
    refresh();
}
function refresh() {
    dataList.innerHTML = `<tr><td colspan="7" class="hint">資料載入中...</td></tr>`;
    dropdownToggle[0].textContent = "排序篩選";
    dropdownToggle[1].textContent = "排序";
    sortBtn.forEach(item => item.hidden = true)
    dropdownToggle[0].style.visibility = "visible";
}

//顯示資料
function renderTable() {
    let str = "";
    switchPageBox.hidden = false;
    if (data.length == 0) {
        str += `<tr><td colspan="7" class="hint">查詢不到當日的交易資訊QQ</td></tr>`;
    } else {
        let dataMaxNum = pageNum * 6;
        data.forEach((item, index) => {
            if (index >= dataMaxNum - 6 && index < dataMaxNum) {
                str += `<tr>
                <th>${item.作物名稱}</th>
                <th>${item.市場名稱}</th>
                <td>${item.上價}</td>
                <td>${item.中價}</td>
                <td>${item.下價}</td>
                <td>${item.平均價}</td>
                <td>${item.交易量}</td>
                </tr>`;
            }
        })
    }
    dataList.innerHTML = str;
    updatePageNum()
}

//更新換頁按鈕&頁碼
function updatePageNum() {
    if (pageNum == 0) {
        previousPageBtn.disabled = true;
        nextPageBtn.disabled = true;
    } else if (pageNum == 1) {
        previousPageBtn.disabled = true;
        nextPageBtn.disabled = false;
    } else if (pageNum == allPageNum) {
        previousPageBtn.disabled = false;
        nextPageBtn.disabled = true;
    } else {
        previousPageBtn.disabled = false;
        nextPageBtn.disabled = false;
    }
    pageNumText.textContent = pageNum;
    allPageNumText.textContent = allPageNum;
}

//下一頁上一頁
previousPageBtn.addEventListener("click", () => {
    pageNum--;
    renderTable();
})
nextPageBtn.addEventListener("click", () => {
    pageNum++;
    renderTable();
})

//搜尋關鍵字
searchBtn.addEventListener("click", () => {
    if (searchInput.value === "") {
        alert('您尚未輸入搜尋條件！');
    } else {
        filterClick("", searchInput.value);
        searchInput.value = "";
    }
})
searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        searchBtn.click();
    }
})

//排序
orderDrop.addEventListener("click", e => {
    if (data.length != 0 && e.target.getAttribute('class') == 'dropdown-item') {
        if (e.target.textContent.length >= 5) {
            sortBtn.forEach(item => item.hidden = false)
            dropdownToggle[0].style.visibility = "hidden";
            sortData(e.target.value);
        } else {
            sortBtn.forEach(item => item.hidden = true)
            sortData(e.target.value);
        }
        dropdownToggle.forEach(item => item.textContent = e.target.textContent)
    }
})
tableHeader.addEventListener("click", e => {
    if (e.target.getAttribute('data-price') != null) {
        sortData(e.target.getAttribute('data-price'));
    }
})
function sortData(sortN) {
    if (sortN == sortItem) {
        sortState = !sortState;
    } else {
        sortItem = sortN;
        sortState = true;
    }
    if (sortState == true) {
        //遞增
        data.sort((firstItem, secondItem) => firstItem[sortItem] - secondItem[sortItem]);
    } else {
        //遞減
        data.sort((firstItem, secondItem) => secondItem[sortItem] - firstItem[sortItem]);
    }
    pageNum = 1;
    renderTable();
}
