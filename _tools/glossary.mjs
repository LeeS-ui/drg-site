// 올리브영 닥터지 브랜드관 표기 기준 제품명 / 고정 용어 (긴 것부터 적용)
export const G = [
['Dermoisture Barrier D Daily Lotion','더모이스처 배리어 D 데일리 로션'],['Dermoisture Barrier D Intense Cream','더모이스처 배리어 D 인텐스 크림'],['Dermoisture Barrier D Liquid Toner','더모이스처 배리어 D 리퀴드 토너'],['Dermoisture Barrier D Multi Balm','더모이스처 배리어 D 멀티밤'],['Dermoisture Barrier D','더모이스처 배리어 D'],['Dermoisture Barrier','더모이스처 배리어'],
['Black Snail Retinol Collagen Serum Intense','블랙스네일 레티놀 콜라겐 세럼 인텐스'],['Black Snail Retinol Wrinkle Mask','블랙스네일 레티놀 링클 마스크'],['Black Snail Retinol Ampoule','블랙스네일 레티놀 앰플'],['Black Snail Emulsion','블랙스네일 에멀전'],['Black Snail Cream','블랙스네일 크림'],['Black Snail Toner','블랙스네일 토너'],['Black Snail Mucin','블랙스네일 뮤신'],['Black Snail','블랙스네일'],
['R.E.D BLEMISH Hyal Cica Cooling Gel Mask','레드 블레미쉬 히알 시카 쿨링 겔 마스크'],['R.E.D BLEMISH Hyal Cica Soothing Serum','레드 블레미쉬 클리어 히알 시카 수딩 세럼'],['R.E.D BLEMISH Cool Soothing Mask','레드 블레미쉬 쿨 수딩 마스크'],['R.E.D BLEMISH Clear Soothing Cream','레드 블레미쉬 클리어 수딩 크림'],['R.E.D BLEMISH Clear Soothing Toner','레드 블레미쉬 클리어 수딩 토너'],['R.E.D BLEMISH Clear Moisture Cream','레드 블레미쉬 클리어 모이스처 크림'],['R.E.D BLEMISH Soothing Up Sun','레드 블레미쉬 수딩 업 선'],['R.E.D BLEMISH','레드 블레미쉬'],['RED BLEMISH','레드 블레미쉬'],
['Hyal Cica Cooling Gel Mask','히알 시카 쿨링 겔 마스크'],['Hyal Cica Soothing Serum','히알 시카 수딩 세럼'],['Clear Soothing Cream','클리어 수딩 크림'],['Clear Soothing Toner','클리어 수딩 토너'],['Clear Moisture Cream','클리어 모이스처 크림'],['Cool Soothing Mask','쿨 수딩 마스크'],['Soothing Up Sun','수딩 업 선'],
['pH Cleansing Red Blemish Clear Soothing Foam','약산성 레드 블레미쉬 클리어 수딩 폼'],['pH Cleansing Gel Foam','약산성 클렌징 젤 폼'],
['Brightening Peeling Gel','브라이트닝 필링젤'],['Brightening Up Sun+','브라이트닝 업 선 플러스'],['Brightening Up Sun','브라이트닝 업 선'],['Green Mild Up Sun+','그린 마일드 업 선 플러스'],['Green Mild Up Sun','그린 마일드 업 선'],['Green Deep Cleansing Oil','그린딥 클렌징 오일'],
['10-CICA COMPLEX','10-시카 콤플렉스'],['10-Cica Exosome','10-시카 엑소좀'],
['Dr.G Story','Dr.G 스토리'],['Brand Story','Dr.G 스토리'],['Dr.G','닥터지'],
];
export function pre(t){let s=t;for(const [a,b] of G){s=s.split(a).join(b);s=s.split(a.toLowerCase()).join(b);s=s.split(a.toUpperCase()).join(b)}return s}
