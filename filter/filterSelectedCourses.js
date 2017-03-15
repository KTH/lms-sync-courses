const coursesToExclude=require('../RemoveTheseCourses')
//  "courseCode": "LT1018",
function filterSelectedCourses(arrayOfArryOfCourseRounds){
  if (coursesToExclude.filter.length === 0) {
    console.log("All courses will pass, course filter is empty....")
    return arrayOfArryOfCourseRounds
  }
  coursesToExclude.filter.map(filter=>
    console.log("Filtering for Course Code: " + filter)
  )

  let result =  arrayOfArryOfCourseRounds.map(courseArray=>{
      return courseArray.filter(courseObject=>{
        let trueOrFalse = coursesToExclude.filter.map(filter=>courseObject.courseCode === filter)
        .indexOf(true) < 0
        console.log(trueOrFalse)
        return trueOrFalse
      })
    })
  console.log("Result = ",result)
  return result
}


module.exports = filterSelectedCourses
