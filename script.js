document.getElementById('additionForm').addEventListener('submit', function(event){
    event.preventDefault(); // Prevents form from submitting in the traditional way

    var num1 = parseInt(document.getElementById('number1').value, 10);
    var num2 = parseInt(document.getElementById('number2').value, 10);
    var sum = num1 + num2;

    document.getElementById('sum').textContent = sum;
});
