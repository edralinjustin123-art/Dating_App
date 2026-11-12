function createInterestsController({pool}){
  return {list:async(req,res)=>{
    const {rows}=await pool.query('SELECT id,slug,name FROM interests ORDER BY name');
    return res.json({interests:rows});
  }};
}
module.exports={createInterestsController};
