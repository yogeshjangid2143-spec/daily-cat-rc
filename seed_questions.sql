DO $$ 
DECLARE
  v_passage_id UUID;
BEGIN
  -- Find the most recent active passage
  SELECT id INTO v_passage_id FROM passages WHERE is_active = true ORDER BY published_date DESC LIMIT 1;
  
  IF v_passage_id IS NULL THEN
    -- If no passage exists at all, insert the sample passage first!
    INSERT INTO passages (id, title, content, word_count, difficulty, topic, published_date, is_active)
    VALUES (
      gen_random_uuid(),
      'India''s GDP Trajectory and Structural Imperatives',
      'India''s recent economic expansion presents a dual narrative of aggregate growth and persistent structural bottlenecks. On paper, the country remains one of the fastest-growing major economies globally, with GDP growth hovering between 6.5% and 7.2% in recent quarters. This aggregate momentum is primarily fueled by public sector capital expenditures and a robust service sector—led by software services, financial consulting, and telecom. However, a deeper examination reveals a consumption dichotomy, often characterized as a K-shaped recovery. While premium goods, real estate, and high-end services are experiencing robust demand, rural demand and mass-market consumer goods are sluggish. This divergence raises critical questions about the inclusivity and sustainability of India''s growth engine.

The core challenge lies in the manufacturing sector''s inability to absorb India''s massive demographic dividend. Despite government programs like "Make in India" and Production Linked Incentive (PLI) schemes designed to spur domestic manufacturing, the sector''s contribution to GDP remains stagnant around 14-16%. Instead, millions of workers leaving agriculture are bypassing the industrial sector entirely, moving directly into low-productivity services, informal retail, or construction. Economists call this premature deindustrialization. The primary impediments are well-known: regulatory compliance burdens, complex land acquisition processes, archaic labor laws, and a pronounced skill mismatch. While India produces millions of graduates annually, only a fraction possess the technical skills required by modern manufacturing and high-end services.

Moreover, private sector capital investment (private capex) has been slow to take off, leaving the government to do the heavy lifting of infrastructure building. Corporate balance sheets have deleveraged significantly, and bank balance sheets are healthier than they have been in a decade, yet corporations remain hesitant to commit capital to greenfield projects. This caution stems from concerns over long-term demand visibility and the high cost of doing business. Additionally, the regulatory environment is perceived as volatile, with sudden changes in tariff structures or compliance mandates. To secure a sustained 8% growth path, India must shift from public-led investment to private-led growth, while aggressively reforming its agricultural and labor ecosystems to create mass-market employment.',
      365,
      2,
      'economics',
      CURRENT_DATE,
      true
    ) RETURNING id INTO v_passage_id;
  END IF;

  -- Delete existing questions to avoid duplicates if you run this multiple times
  DELETE FROM questions WHERE passage_id = v_passage_id;

  -- Insert questions for this passage
  INSERT INTO questions (passage_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, question_type, order_index)
  VALUES 
  (
    v_passage_id,
    'Which of the following best summarizes the ''consumption dichotomy'' described by the author in the passage?',
    'A. A significant gap between the growth of software services and traditional manufacturing industries.',
    'B. Robust demand for premium goods alongside sluggish rural and mass-market consumer demand.',
    'C. A conflict between government infrastructure capital expenditures and private sector investment.',
    'D. The contrast between high graduate output and low employment rates in rural sectors.',
    'B',
    'The passage directly defines this dichotomy (often referred to as a ''K-shaped recovery'') by contrasting robust demand in premium goods, real estate, and high-end services with sluggish rural demand and mass-market consumer goods. Option B captures this exactly.',
    'main_idea',
    0
  ),
  (
    v_passage_id,
    'What does the author imply by using the term ''premature deindustrialization'' in the second paragraph?',
    'A. The industrial sector is actively shrinking due to automation and technological advancement.',
    'B. India is skipping the traditional transition to manufacturing, with laborers moving from agriculture straight into low-productivity services.',
    'C. Government schemes like PLI are shutting down early due to lack of corporate interest.',
    'D. Foreign companies are exiting the Indian market due to complex compliance burdens.',
    'B',
    'The text explains that workers leaving agriculture are bypassing the industrial sector entirely and moving directly into low-productivity services or construction.',
    'inference',
    1
  ),
  (
    v_passage_id,
    'According to the passage, which of the following is NOT listed as a barrier to manufacturing growth in India?',
    'A. A lack of corporate credit availability and high bank non-performing assets.',
    'B. Regulatory compliance burdens and volatile tariff structures.',
    'C. Challenges in acquiring land and archaic labor laws.',
    'D. A skill mismatch that leaves graduates unemployable in modern industry.',
    'A',
    'The passage notes that ''bank balance sheets are healthier than they have been in a decade,'' indicating that a lack of bank credit availability or bad loans is NOT the current bottleneck.',
    'factual',
    2
  ),
  (
    v_passage_id,
    'Based on the text, what is the author''s tone regarding India''s future economic prospects?',
    'A. Uncritically optimistic, focusing primarily on the 7.2% GDP growth rate.',
    'B. Alarmist and dismissive, claiming that the economic model is on the verge of collapse.',
    'C. Analytical and cautious, acknowledging growth while highlighting key structural challenges.',
    'D. Indifferent, presenting raw statistics without prescribing any reforms.',
    'C',
    'The author is objective and analytical: acknowledging India''s status as a fast-growing economy (6.5%-7.2% growth) but raising serious concerns about sustainability.',
    'tone',
    3
  ),
  (
    v_passage_id,
    'It can be inferred from the passage that a shift from public-led to private-led growth requires:',
    'A. The government to completely stop investing in public infrastructure projects.',
    'B. Corporations gaining better long-term demand visibility and a more stable regulatory environment.',
    'C. A complete ban on software and service imports to force domestic spending.',
    'D. Forcing agricultural workers to remain on farms through regulatory mandates.',
    'B',
    'The passage notes that private sector caution stems from ''concerns over long-term demand visibility'' and a ''volatile'' regulatory environment. Option B directly addresses these core factors.',
    'inference',
    4
  );
END $$;
