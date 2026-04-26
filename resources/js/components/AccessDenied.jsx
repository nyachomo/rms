export default function AccessDenied() {
    return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', padding:40, textAlign:'center' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <i className="fas fa-lock" style={{ fontSize:'1.8rem', color:'#dc2626' }}></i>
            </div>
            <h2 style={{ fontFamily:'Poppins,sans-serif', color:'#111827', marginBottom:8, fontSize:'1.3rem' }}>Access Denied</h2>
            <p style={{ color:'#6b7280', fontSize:'.95rem', maxWidth:380 }}>
                You don't have permission to view this page. Contact your administrator to request access.
            </p>
        </div>
    );
}
