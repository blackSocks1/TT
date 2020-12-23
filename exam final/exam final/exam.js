/*
var btn = document.getElementById("but");
var names = document.querySelectorAll('input');
var c = 0;
//var courses = document.querySelectorAll("input");

btn.addEventListener('click', function () {
    var dis = [];
    var output = document.getElementsByTagName('output');
    for (var i = 0; i < names.length; i++) {
        var a = document.getElementsByTagName('input')[i].value;
        dis.push(a);
    }
    console.log(dis);
    build(dis)
})

function build(data) {
    var output = document.querySelectorAll('output');

    for (var i = 0; i < data.length; i++) {
        var b = data[i];
        c = + 1;
        output[i].innerHTML += b + "\t"
        if (c == 4) {
            let brk = document.createElement('b');
            output.appendChild(brk)
            c = 0;
        }
    }
}
*/

var btn = document.getElementById("but");
var course = document.getElementsByClassName('course')
var date = document.getElementsByClassName('date')
var time = document.getElementsByClassName('time')
var head = document.getElementsByClassName('head')

 
btn.addEventListener('click', function (){
    var output_course = document.querySelectorAll('.rec_course');
    var output_date = document.querySelectorAll('.rec_date');
    var output_time = document.querySelectorAll('.rec_time');
    var output_head = document.querySelectorAll('.rec_head');
    var disC = [];
    var disD = [];
    var disT = [];
    var disH = [];
    
    for(var i = 0; i < course.length; i++){
        var C = document.querySelectorAll('.course')[i].value
        disC.push(C);
    }
    for(var i = 0; i < date.length; i++){
    var D = document.querySelectorAll('.date')[i].value
    disD.push(D);
    }
    for (var i = 0; i < time.length; i++) {
        var T = document.querySelectorAll('.time')[i].value
        disT.push(T);
    }
    for (var i = 0; i < head.length; i++) {
        var H = document.querySelectorAll('.head')[i].value
        disH.push(H);
    }
    console.log(disC); 
    console.log(disD);
    console.log(disT);
    console.log(disH);
    for (var i = 0; i < output_course.length; i++) {
        output_course[i].value = disC[i];
        console.log(output_course[i].value);
    }
    for (var i = 0; i < output_date.length; i++) {
        output_date[i].value = disD[i];
        console.log(output_date[i].value);
    }
    for (var i = 0; i < output_time.length; i++) {
        output_time[i].value = disT[i];
        console.log(output_time[i].value);
    }
    for (var i = 0; i < output_head.length; i++) {
        output_head[i].value = disH[i];
        console.log(output_head[i].value);
    }
})



function exam_template(num_of_specialties, num_of_days, courses_per_day, index_of_breaks, user) {
    var body = document.getElementsByTagName('body')[0];
    let table = document.createElement("table");
    let div = document.createElement("div");
    if (user.id !== undefined) {
        table.setAttribute("id", user.id);
        div.innerHTML = `<br><span><h4>${user.name}</h4></span>`;
    } else {
        table.setAttribute("class", 'stud_TT');
        div.innerHTML = `<br><br><span><h4>${user}</h4></span>`;
    }

    let thead1 = document.createElement('tr');
    let thead2 = document.createElement('tr');
    let thead3 = document.createElement('tr');
    thead1.innerHTML = `<th colspan="${num_of_specialties + 1}">
            <output type="text" class="rec_head"></output>
        </th>`;
    table.appendChild(thead1);
    thead2.innerHTML = `<th colspan="${num_of_specialties + 1}">
            <output type="text" class="rec_head"></output>
        </th>`;
    table.appendChild(thead2);
    thead3.innerHTML = `<td>TIME</td>`;

    for (var i = 0; i < num_of_specialties; i++) {
        let td1 = document.createElement('td');
        td1.innerHTML = `<td><output class="rec_head"></output></td>`;
        thead3.appendChild(td1);
    }
    table.appendChild(thead3);
    for (let i = 0; i < num_of_days; i++) {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="${num_of_specialties + 1}">
                <output type="date" class="rec_date"></output>
            </td>`;
        table.appendChild(tr);

        for (let j = 0; j < courses_per_day; j++) {
            let tr1 = document.createElement('tr');
            tr1.innerHTML = `<td>
                start: <output type="time" class="rec_time"></output><br>
                stop: <output type="time" class="rec_time"></output>
            </td>`;
            for (let k = 0; k < num_of_specialties; k++) {
                let td = document.createElement('td');
                td.innerHTML = ` <td><output type="text" class="rec_course"></td>`;
                tr1.appendChild(td);
            }
            table.appendChild(tr1);
            if (j === index_of_breaks && index_of_breaks < courses_per_day - 1) {
                let tr2 = document.createElement('tr');
                tr2.innerHTML = `<td>
                start: <output type="time" class="rec_time"></output><br>
                stop: <output type="time" class="rec_time"></output>
            </td>
            <td colspan="${num_of_specialties}">Break</td>`;
                table.appendChild(tr2);
            }

        }
    }
    div.appendChild(table);
    body.appendChild(div);
}
document.getElementById('create').addEventListener('click', function(){
    exam_template(8, 6, 3, 1, 'student');

})