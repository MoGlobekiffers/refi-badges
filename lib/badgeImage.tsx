/** Composants JSX pour décrire le badge */
import * as React from 'react';

const BG = '#10B981';
const FG = '#ffffff';
const DARK = '#064E3B';

export function BadgeView(props: {
  habit: string;
  count: number;
  target: number;
  username?: string;
  date?: string;
}) {
  const { habit, count, target, username = 'ReFi Badges', date } = props;

  return (
    <div style={{
      height:'100%', width:'100%', display:'flex',
      background: BG, color: FG,
      fontFamily:'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI'
    }}>
      <div style={{
        margin:40, padding:40, borderRadius:24, background:'rgba(0,0,0,.15)',
        display:'flex', flexDirection:'column', justifyContent:'space-between', width:'100%'
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontSize:40, fontWeight:700, letterSpacing:.5}}>{username}</div>
          <div style={{fontSize:24, opacity:.9}}>{date ?? new Date().toISOString().slice(0,10)}</div>
        </div>

        <div>
          <div style={{fontSize:28, opacity:.9, marginBottom:8}}>Habit</div>
          <div style={{fontSize:56, fontWeight:800}}>{habit}</div>
        </div>

        <div style={{display:'flex', alignItems:'baseline', gap:16}}>
          <div style={{fontSize:28, opacity:.9}}>Progress</div>
          <div style={{fontSize:72, fontWeight:900}}>{count}/{target}</div>
          <div style={{
            marginLeft:'auto', padding:'12px 20px', borderRadius:12,
            background: FG, color: DARK, fontWeight:700
          }}>
            TARGET MET
          </div>
        </div>
      </div>
    </div>
  );
}
